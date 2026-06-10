const fs = require("node:fs");
const path = require("node:path");
const postgres = require("postgres");

function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getMigrationFiles() {
  const drizzleDir = path.resolve(process.cwd(), "drizzle");

  if (!fs.existsSync(drizzleDir)) {
    throw new Error("drizzle directory not found.");
  }

  return fs
    .readdirSync(drizzleDir)
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function isPlaceholderDatabaseUrl(value) {
  return (
    !value ||
    value.includes("[YOUR-PASSWORD]") ||
    value.includes("[PROJECT-REF]") ||
    value.includes("replace-me")
  );
}

function normalizeSql(sqlText) {
  return sqlText
    .replace(/-->\s*statement-breakpoint/g, ";\n")
    .trim();
}

function isBenignDuplicateError(error) {
  const duplicateCodes = new Set(["42P07", "42710", "42701", "23505"]);

  if (error && typeof error.code === "string" && duplicateCodes.has(error.code)) {
    return true;
  }

  const message = String(error?.message || "").toLowerCase();

  return (
    message.includes("already exists") ||
    message.includes("duplicate key") ||
    message.includes("is duplicated")
  );
}

async function ensureMigrationTable(sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS public._app_migrations (
      id bigserial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function getAppliedMigrations(sql) {
  const rows = await sql.unsafe("SELECT name FROM public._app_migrations ORDER BY name");
  return new Set(rows.map((row) => row.name));
}

async function markApplied(sql, fileName) {
  await sql`
    INSERT INTO public._app_migrations (name)
    VALUES (${fileName})
    ON CONFLICT (name) DO NOTHING
  `;
}

async function withMigrationLock(sql, callback) {
  const lockId = 846435201;

  await sql`SELECT pg_advisory_lock(${lockId})`;

  try {
    return await callback();
  } finally {
    await sql`SELECT pg_advisory_unlock(${lockId})`;
  }
}

async function run() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");

  const databaseUrl = process.env.DATABASE_URL;

  if (isPlaceholderDatabaseUrl(databaseUrl)) {
    throw new Error("DATABASE_URL is not configured with a real PostgreSQL connection string.");
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
    prepare: false,
    connect_timeout: 30,
    max: 1,
  });

  try {
    await withMigrationLock(sql, async () => {
      await sql`SELECT 1`;
      await ensureMigrationTable(sql);
      const applied = await getAppliedMigrations(sql);
      const files = getMigrationFiles();

      if (files.length === 0) {
        console.log("No SQL migration files found in drizzle directory.");
        return;
      }

      let appliedCount = 0;

      for (const fileName of files) {
        if (applied.has(fileName)) {
          console.log(`skip ${fileName} (already applied)`);
          continue;
        }

        const filePath = path.resolve(process.cwd(), "drizzle", fileName);
        const rawSql = fs.readFileSync(filePath, "utf8");
        const sqlText = normalizeSql(rawSql);

        if (!sqlText) {
          await markApplied(sql, fileName);
          console.log(`skip ${fileName} (empty)`);
          continue;
        }

        try {
          await sql.begin(async (tx) => {
            await tx.unsafe(sqlText);
            await markApplied(tx, fileName);
          });

          appliedCount += 1;
          console.log(`applied ${fileName}`);
        } catch (error) {
          if (isBenignDuplicateError(error)) {
            console.error(
              `failed ${fileName}: ${error.message}. The database already has part of this migration; reconcile it before marking the migration applied.`
            );
            throw error;
          }

          console.error(`failed ${fileName}: ${error.message}`);
          throw error;
        }
      }

      console.log(`Migration complete. Applied ${appliedCount} migration(s).`);
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run().catch((error) => {
  console.error("Database migration failed", error);
  process.exit(1);
});
