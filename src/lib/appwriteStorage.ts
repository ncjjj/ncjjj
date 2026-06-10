import { Client, Storage, Tokens, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

interface AppwriteStorageConfig {
  endpoint: string;
  projectId: string;
  apiKey: string;
  bucketId: string;
  isPublic: boolean;
}

interface UploadFileInput {
  file: File;
  folder: string; // Left for compatibility; unused in Appwrite flat bucket structure
  contentType?: string;
}

interface UploadBufferInput {
  fileBuffer: Uint8Array;
  fileName: string;
  fileType?: string;
  folder: string; // Left for compatibility
}

interface ResolveObjectUrlInput {
  path: string; // In Appwrite, path is the File ID
  expiresIn?: number;
  version?: number | null;
}

interface ObjectUrlResult {
  avatarUrl: string;
  visibility: "public" | "private";
}

function getAppwriteConfig(): AppwriteStorageConfig {
  const endpoint = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const bucketId = process.env.APPWRITE_BUCKET_ID;
  const isPublic = process.env.APPWRITE_STORAGE_PUBLIC === "true";

  const missing: string[] = [];
  if (!projectId) missing.push("APPWRITE_PROJECT_ID");
  if (!apiKey) missing.push("APPWRITE_API_KEY");
  if (!bucketId) missing.push("APPWRITE_BUCKET_ID");

  if (missing.length > 0) {
    throw new Error(
      `Appwrite storage is not configured. Missing environment variable(s): ${missing.join(", ")}`
    );
  }

  return {
    endpoint,
    projectId: projectId as string,
    apiKey: apiKey as string,
    bucketId: bucketId as string,
    isPublic,
  };
}

let appwriteClient: Client | null = null;

function getAppwriteClient(): Client {
  if (appwriteClient) {
    return appwriteClient;
  }

  const { endpoint, projectId, apiKey } = getAppwriteConfig();

  appwriteClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return appwriteClient;
}

function getAppwriteStorage(): Storage {
  return new Storage(getAppwriteClient());
}

function getAppwriteTokens(): Tokens {
  return new Tokens(getAppwriteClient());
}

function generateAppwriteFileId(fileName: string): string {
  const timestamp = Date.now();
  const prefix = `${timestamp}-`;
  const remainingLength = 36 - prefix.length;

  const cleanName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-_]/g, "")
    .replace(/^[^a-z0-9]+/g, "");

  const truncatedName = cleanName.slice(0, remainingLength).replace(/[-._]+$/g, "");
  
  if (!truncatedName) {
    return `${timestamp}`;
  }

  return `${prefix}${truncatedName}`;
}

const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
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

export function getAppwriteBucketVisibility(): "public" | "private" {
  const { isPublic } = getAppwriteConfig();
  return isPublic ? "public" : "private";
}

export function getAppwritePublicObjectUrl(fileId: string): string {
  if (!fileId) {
    throw new Error("File ID is required to create a public URL.");
  }

  const { endpoint, projectId, bucketId } = getAppwriteConfig();
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

export async function assertAppwriteObjectExists(fileId: string) {
  if (!fileId) {
    throw new Error("File ID is required to verify upload.");
  }

  const { bucketId } = getAppwriteConfig();
  const storage = getAppwriteStorage();

  try {
    const file = await storage.getFile(bucketId, fileId);
    if (!file) {
      throw new Error("File not found");
    }
  } catch (error: any) {
    throw new Error(
      `Upload verification failed: file was not found in bucket (${error?.message || "unknown error"}).`
    );
  }
}

export async function uploadFileToAppwrite({ file, contentType }: UploadFileInput) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const config = getAppwriteConfig();
  const fileId = generateAppwriteFileId(file.name || "upload");
  const resolvedContentType =
    contentType?.trim() ||
    file.type?.trim() ||
    inferImageMimeType(file.name || fileId, file.type) ||
    "application/octet-stream";

  console.log("[Appwrite Storage] Preparing file upload:", {
    fileName: file.name,
    fileSize: file.size,
    resolvedContentType,
    generatedFileId: fileId,
  });

  const fileBuffer = await file.arrayBuffer();
  const storage = getAppwriteStorage();

  const input = InputFile.fromBuffer(Buffer.from(fileBuffer), file.name || "upload");
  const response = await storage.createFile(config.bucketId, fileId, input);

  console.log("[Appwrite Storage] Upload response metadata:", response);

  await assertAppwriteObjectExists(fileId);

  const publicUrl = config.isPublic ? getAppwritePublicObjectUrl(fileId) : null;

  return {
    bucket: config.bucketId,
    path: fileId,
    publicUrl,
    fileName: file.name,
    mimeType: resolvedContentType,
  };
}

export async function createSignedAppwriteObjectUrl({
  path,
  expiresIn = 3600,
}: {
  path: string;
  expiresIn?: number;
}) {
  if (!path) {
    throw new Error("File ID is required to create a signed URL.");
  }

  const config = getAppwriteConfig();
  const tokens = getAppwriteTokens();

  // Create file token expiring in `expiresIn` seconds
  const expireDate = new Date(Date.now() + expiresIn * 1000).toISOString();
  
  console.log("[Appwrite Tokens] Requesting file token for:", {
    fileId: path,
    expiresInSeconds: expiresIn,
    expireDate,
  });

  const tokenObj = await tokens.createFileToken({
    bucketId: config.bucketId,
    fileId: path,
    expire: expireDate,
  });

  console.log("[Appwrite Tokens] Token response:", tokenObj);

  if (!tokenObj?.secret) {
    throw new Error("Unable to create file token for storage object.");
  }

  const signedUrl = `${config.endpoint}/storage/buckets/${config.bucketId}/files/${path}/view?project=${config.projectId}&token=${tokenObj.secret}`;
  console.log("[Appwrite Storage] Secure access URL generated:", signedUrl);

  return signedUrl;
}

export async function resolveAppwriteObjectUrl({
  path,
  expiresIn = 3600,
  version,
}: ResolveObjectUrlInput): Promise<ObjectUrlResult> {
  if (!path) {
    throw new Error("File ID is required to resolve URL.");
  }

  const visibility = getAppwriteBucketVisibility();

  if (visibility === "public") {
    const publicUrl = getAppwritePublicObjectUrl(path);
    return {
      avatarUrl: withVersionQueryParam(publicUrl, version),
      visibility,
    };
  }

  const signedUrl = await createSignedAppwriteObjectUrl({ path, expiresIn });
  return {
    avatarUrl: withVersionQueryParam(signedUrl, version),
    visibility,
  };
}

export async function createSignedAppwriteObjectUrls(
  paths: string[] = [],
  expiresIn = 3600
): Promise<Record<string, string | null>> {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));

  if (uniquePaths.length === 0) {
    return {};
  }

  const signedPairs = await Promise.all(
    uniquePaths.map(async (path): Promise<[string, string | null]> => {
      try {
        const signedUrl = await createSignedAppwriteObjectUrl({ path, expiresIn });
        return [path, signedUrl];
      } catch {
        return [path, null];
      }
    })
  );

  return Object.fromEntries(signedPairs);
}

export async function listAppwriteObjects(prefix = "", options: { limit?: number; offset?: number } = {}) {
  const config = getAppwriteConfig();
  const storage = getAppwriteStorage();

  const queries: string[] = [];
  if (options.limit) queries.push(Query.limit(options.limit));
  if (options.offset) queries.push(Query.offset(options.offset));

  const response = await storage.listFiles(config.bucketId, queries);
  let files = response.files || [];

  if (prefix) {
    files = files.filter((f) => f.$id.startsWith(prefix) || f.name.startsWith(prefix));
  }

  return files.map((obj: any) => ({
    name: obj.name,
    path: obj.$id,
    metadata: {
      size: obj.sizeOriginal || obj.size,
      mimeType: obj.mimeType,
    },
    createdAt: obj.$createdAt || null,
    id: obj.$id || null,
  }));
}

export async function deleteAppwriteObjects(paths: string[] = []) {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));

  if (uniquePaths.length === 0) {
    return;
  }

  const config = getAppwriteConfig();
  const storage = getAppwriteStorage();

  for (const path of uniquePaths) {
    try {
      await storage.deleteFile(config.bucketId, path);
    } catch (error: any) {
      if (error?.code !== 404) {
        throw new Error(`Appwrite delete failed for ${path}: ${error.message}`);
      }
    }
  }
}

export async function uploadBufferToAppwrite({
  fileBuffer,
  fileName,
  fileType,
}: UploadBufferInput) {
  if (!fileBuffer) {
    throw new Error("No file buffer provided for upload.");
  }

  const config = getAppwriteConfig();
  const fileId = generateAppwriteFileId(fileName || "upload");
  const contentType = inferImageMimeType(fileName || fileId, fileType) || "application/octet-stream";
  const storage = getAppwriteStorage();

  console.log("[Appwrite Storage] Preparing buffer upload:", {
    fileName,
    bufferSize: fileBuffer.byteLength,
    contentType,
    generatedFileId: fileId,
  });

  const input = InputFile.fromBuffer(Buffer.from(fileBuffer), fileName || "upload");
  const response = await storage.createFile(config.bucketId, fileId, input);

  console.log("[Appwrite Storage] Buffer upload response metadata:", response);

  await assertAppwriteObjectExists(fileId);

  const publicUrl = config.isPublic ? getAppwritePublicObjectUrl(fileId) : null;

  return {
    bucket: config.bucketId,
    path: fileId,
    publicUrl,
    fileName,
    mimeType: contentType,
  };
}
