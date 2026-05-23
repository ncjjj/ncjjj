import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

interface SupabaseStorageConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
  bucketPublic: boolean;
}

interface UploadFileInput {
  file: File;
  folder: string;
}

interface UploadBufferInput {
  fileBuffer: Uint8Array;
  fileName: string;
  fileType?: string;
  folder: string;
}

interface ResolveObjectUrlInput {
  path: string;
  expiresIn?: number;
  version?: number | null;
}

interface ObjectUrlResult {
  avatarUrl: string;
  visibility: "public" | "private";
}

function getSupabaseConfig(): SupabaseStorageConfig {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "profile-assets";
  const bucketPublic = String(process.env.SUPABASE_STORAGE_PUBLIC || "false").toLowerCase() === "true";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage is not configured.");
  }

  return { supabaseUrl, serviceRoleKey, bucket, bucketPublic };
}

let supabaseServerClient: SupabaseClient | null = null;

function getSupabaseServerClient(): SupabaseClient {
  if (supabaseServerClient) {
    return supabaseServerClient;
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

  supabaseServerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseServerClient;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function inferImageMimeType(fileName: string, providedType?: string): string {
  const normalizedType = String(providedType || "")
    .trim()
    .toLowerCase();

  if (normalizedType) {
    const allowed = Object.values(IMAGE_MIME_BY_EXTENSION);
    if (allowed.includes(normalizedType)) {
      return normalizedType;
    }
  }

  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return IMAGE_MIME_BY_EXTENSION[extension] || "";
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  const copied = Uint8Array.from(data);
  return copied.buffer as ArrayBuffer;
}

function withVersionQueryParam(rawUrl: string, version?: number | null): string {
  if (!version || Number.isNaN(version)) {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.set("v", String(version));
    return parsed.toString();
  } catch {
    const separator = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${separator}v=${encodeURIComponent(String(version))}`;
  }
}

export function getSupabaseBucketVisibility(): "public" | "private" {
  const { bucketPublic } = getSupabaseConfig();
  return bucketPublic ? "public" : "private";
}

export function getSupabasePublicObjectUrl(path: string): string {
  if (!path) {
    throw new Error("Storage path is required to create a public URL.");
  }

  const { bucket } = getSupabaseConfig();
  const normalizedPath = String(path).replace(/^\/+/, "");
  const supabase = getSupabaseServerClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(normalizedPath);

  if (!data?.publicUrl) {
    throw new Error("Unable to create public URL for storage object.");
  }

  return data.publicUrl;
}

export async function assertSupabaseObjectExists(path: string) {
  if (!path) {
    throw new Error("Storage path is required to verify upload.");
  }

  const { bucket } = getSupabaseConfig();
  const normalizedPath = String(path).replace(/^\/+/, "");
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.storage.from(bucket).download(normalizedPath);

  if (error || !data) {
    throw new Error(
      `Upload verification failed: object was not found in bucket (${error?.message || "unknown error"}).`
    );
  }
}

export async function uploadFileToSupabase({ file, folder }: UploadFileInput) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const { bucket, bucketPublic } = getSupabaseConfig();
  const safeName = sanitizeFileName(file.name || "upload");
  const objectPath = `${folder}/${Date.now()}-${safeName}`;
  const contentType = inferImageMimeType(file.name || safeName, file.type) || "application/octet-stream";
  const fileBuffer = await file.arrayBuffer();
  const uploadBody = new Blob([fileBuffer], { type: contentType });
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.storage.from(bucket).upload(objectPath, uploadBody, {
    upsert: true,
    contentType,
  });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  await assertSupabaseObjectExists(objectPath);

  const publicUrl = bucketPublic ? getSupabasePublicObjectUrl(objectPath) : null;

  return {
    bucket,
    path: objectPath,
    publicUrl,
    fileName: file.name,
    mimeType: contentType,
  };
}

export async function createSignedSupabaseObjectUrl({
  path,
  expiresIn = 3600,
}: {
  path: string;
  expiresIn?: number;
}) {
  if (!path) {
    throw new Error("Storage path is required to create a signed URL.");
  }

  const { bucket } = getSupabaseConfig();
  const normalizedPath = String(path).replace(/^\/+/, "");
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(normalizedPath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Supabase signed URL failed: ${error?.message || "Unknown error"}`);
  }

  return data.signedUrl;
}

export async function resolveSupabaseObjectUrl({
  path,
  expiresIn = 3600,
  version,
}: ResolveObjectUrlInput): Promise<ObjectUrlResult> {
  if (!path) {
    throw new Error("Storage path is required to resolve URL.");
  }

  const visibility = getSupabaseBucketVisibility();

  if (visibility === "public") {
    const publicUrl = getSupabasePublicObjectUrl(path);
    return {
      avatarUrl: withVersionQueryParam(publicUrl, version),
      visibility,
    };
  }

  const signedUrl = await createSignedSupabaseObjectUrl({ path, expiresIn });
  return {
    avatarUrl: withVersionQueryParam(signedUrl, version),
    visibility,
  };
}

export async function createSignedSupabaseObjectUrls(
  paths: string[] = [],
  expiresIn = 3600
): Promise<Record<string, string | null>> {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean).map((item) => String(item).replace(/^\/+/, ""))));

  if (uniquePaths.length === 0) {
    return {};
  }

  const signedPairs = await Promise.all(
    uniquePaths.map(async (path): Promise<[string, string | null]> => {
      try {
        const signedUrl = await createSignedSupabaseObjectUrl({ path, expiresIn });
        return [path, signedUrl];
      } catch {
        return [path, null];
      }
    })
  );

  return Object.fromEntries(signedPairs);
}

export async function listSupabaseObjects(prefix = "", options: { limit?: number; offset?: number } = {}) {
  const { bucket } = getSupabaseConfig();
  const supabase = getSupabaseServerClient();

  const listOptions: any = {};
  if (options.limit) listOptions.limit = options.limit;
  if (options.offset) listOptions.offset = options.offset;

  const { data, error } = await supabase.storage.from(bucket).list(String(prefix).replace(/^\/+/, ""), listOptions);

  if (error) {
    throw new Error(`Supabase list objects failed: ${error.message}`);
  }

  return (data || []).map((obj: any) => ({
    name: obj.name,
    path: `${String(prefix).replace(/\/+$/, "")}/${obj.name}`.replace(/^\/+/, ""),
    metadata: obj.metadata || null,
    createdAt: obj.created_at || obj.updated_at || null,
    id: obj.id || null,
  }));
}

export async function deleteSupabaseObjects(paths: string[] = []) {
  const uniquePaths = Array.from(
    new Set(paths.filter(Boolean).map((item) => String(item).replace(/^\/+/, "")))
  );

  if (uniquePaths.length === 0) {
    return;
  }

  const { bucket } = getSupabaseConfig();
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.storage.from(bucket).remove(uniquePaths);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
}

export async function uploadBufferToSupabase({
  fileBuffer,
  fileName,
  fileType,
  folder,
}: UploadBufferInput) {
  if (!fileBuffer) {
    throw new Error("No file buffer provided for upload.");
  }

  const { bucket, bucketPublic } = getSupabaseConfig();
  const safeName = sanitizeFileName(fileName || "upload");
  const objectPath = `${folder}/${Date.now()}-${safeName}`;
  const contentType = inferImageMimeType(fileName || safeName, fileType) || "application/octet-stream";
  const requestBody = new Blob([toArrayBuffer(fileBuffer)], { type: contentType });
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.storage.from(bucket).upload(objectPath, requestBody, {
    upsert: true,
    contentType,
  });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  await assertSupabaseObjectExists(objectPath);

  const publicUrl = bucketPublic ? getSupabasePublicObjectUrl(objectPath) : null;

  return {
    bucket,
    path: objectPath,
    publicUrl,
    fileName,
    mimeType: contentType,
  };
}
