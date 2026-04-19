import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "profile-assets";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage is not configured.");
  }

  return { supabaseUrl, serviceRoleKey, bucket };
}

let supabaseServerClient;

function getSupabaseServerClient() {
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

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadFileToSupabase({ file, folder }) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
  const safeName = sanitizeFileName(file.name || "upload");
  const objectPath = `${folder}/${Date.now()}-${safeName}`;
  const fileBuffer = await file.arrayBuffer();

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "x-upsert": "true",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: Buffer.from(fileBuffer),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upload failed: ${errorText}`);
  }

  return {
    bucket,
    path: objectPath,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function createSignedSupabaseObjectUrl({ path, expiresIn = 3600 }) {
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

export async function createSignedSupabaseObjectUrls(paths = [], expiresIn = 3600) {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean).map((item) => String(item).replace(/^\/+/, ""))));

  if (uniquePaths.length === 0) {
    return {};
  }

  const signedPairs = await Promise.all(
    uniquePaths.map(async (path) => {
      try {
        const signedUrl = await createSignedSupabaseObjectUrl({ path, expiresIn });
        return [path, signedUrl];
      } catch (error) {
        return [path, null];
      }
    })
  );

  return Object.fromEntries(signedPairs);
}

export async function uploadBufferToSupabase({
  fileBuffer,
  fileName,
  fileType,
  folder,
}) {
  if (!fileBuffer) {
    throw new Error("No file buffer provided for upload.");
  }

  const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
  const safeName = sanitizeFileName(fileName || "upload");
  const objectPath = `${folder}/${Date.now()}-${safeName}`;

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "x-upsert": "true",
        "Content-Type": fileType || "application/octet-stream",
      },
      body: fileBuffer,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upload failed: ${errorText}`);
  }

  return {
    bucket,
    path: objectPath,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`,
    fileName,
    mimeType: fileType || "application/octet-stream",
  };
}
