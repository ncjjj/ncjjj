const postgres = require("postgres");

function normalizeStoragePath(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^\/+/, "").split("?")[0];
  }

  try {
    const url = new URL(trimmed);
    const marker = "/storage/v1/object/";
    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    const storageTail = url.pathname.slice(index + marker.length);
    const normalizedTail = storageTail
      .replace(/^(public|sign|authenticated)\//, "")
      .replace(/^profile-assets\//, "");

    return normalizedTail.replace(/^\/+/, "").split("?")[0] || null;
  } catch (error) {
    return null;
  }
}

async function tableExists(sql, tableName) {
  const rows = await sql`SELECT to_regclass(${`public.${tableName}`}) AS regclass`;
  return Boolean(rows[0]?.regclass);
}

async function columnExists(sql, tableName, columnName) {
  const rows = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
      AND column_name = ${columnName}
    LIMIT 1
  `;

  return rows.length > 0;
}

async function ensureServiceDocumentPathColumn(sql) {
  const hasTable = await tableExists(sql, "service_documents");
  if (!hasTable) {
    return false;
  }

  const hasFilePath = await columnExists(sql, "service_documents", "file_path");
  if (!hasFilePath) {
    await sql`ALTER TABLE service_documents ADD COLUMN file_path text`;
  }

  return true;
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
    prepare: false,
  });

  try {
    const hasUsers = await tableExists(sql, "users");
    if (hasUsers) {
      const hasAvatarPath = await columnExists(sql, "users", "avatar_path");
      const hasAvatarUrl = await columnExists(sql, "users", "avatar_url");

      if (hasAvatarPath) {
        const users = await sql`
          SELECT id, avatar_path
          FROM users
          WHERE avatar_path IS NOT NULL AND avatar_path <> ''
        `;

        for (const user of users) {
          const normalized = normalizeStoragePath(user.avatar_path);
          if (normalized && normalized !== user.avatar_path) {
            await sql`UPDATE users SET avatar_path = ${normalized} WHERE id = ${user.id}`;
          }
        }
      } else if (hasAvatarUrl) {
        const users = await sql`
          SELECT id, avatar_url
          FROM users
          WHERE avatar_url IS NOT NULL AND avatar_url <> ''
        `;

        for (const user of users) {
          const normalized = normalizeStoragePath(user.avatar_url);
          if (normalized && normalized !== user.avatar_url) {
            await sql`UPDATE users SET avatar_url = ${normalized} WHERE id = ${user.id}`;
          }
        }
      }
    }

    const hasDocuments = await tableExists(sql, "documents");
    if (hasDocuments) {
      const docs = await sql`SELECT id, file_url, storage_path FROM documents`;

      for (const doc of docs) {
        const normalizedFile = normalizeStoragePath(doc.file_url);
        const normalizedStorage = normalizeStoragePath(doc.storage_path);
        const nextPath = normalizedStorage || normalizedFile;

        if (!nextPath) {
          continue;
        }

        await sql`
          UPDATE documents
          SET file_url = ${nextPath},
              storage_path = ${nextPath}
          WHERE id = ${doc.id}
        `;
      }
    }

    const hasServiceDocs = await ensureServiceDocumentPathColumn(sql);
    if (hasServiceDocs) {
      const hasFileUrl = await columnExists(sql, "service_documents", "file_url");
      const serviceDocs = hasFileUrl
        ? await sql`SELECT id, file_url, file_path FROM service_documents`
        : await sql`SELECT id, NULL::text AS file_url, file_path FROM service_documents`;

      for (const doc of serviceDocs) {
        const normalizedPath =
          normalizeStoragePath(doc.file_path) || normalizeStoragePath(doc.file_url);

        if (!normalizedPath) {
          continue;
        }

        await sql`UPDATE service_documents SET file_path = ${normalizedPath} WHERE id = ${doc.id}`;
      }

      if (hasFileUrl) {
        await sql`UPDATE service_documents SET file_path = file_url WHERE file_path IS NULL OR file_path = ''`;
      }
    }

    console.log("Storage path migration complete.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run().catch((error) => {
  console.error("Storage path migration failed", error);
  process.exit(1);
});
