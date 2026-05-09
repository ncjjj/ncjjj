const dns = require("node:dns/promises");
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

function isPlaceholderDatabaseUrl(value) {
  return (
    !value ||
    value.includes("[YOUR-PASSWORD]") ||
    value.includes("[PROJECT-REF]") ||
    value.includes("replace-me")
  );
}

function getMigrationFiles() {
  const drizzleDir = path.resolve(process.cwd(), "drizzle");

  if (!fs.existsSync(drizzleDir)) {
    return [];
  }

  return fs
    .readdirSync(drizzleDir)
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function tableExists(sql, tableName) {
  const rows = await sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    ) AS exists
  `;

  return Boolean(rows[0]?.exists);
}

async function run() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");

  const databaseUrl = process.env.DATABASE_URL;

  if (isPlaceholderDatabaseUrl(databaseUrl)) {
    throw new Error("DATABASE_URL is not configured with a real PostgreSQL connection string.");
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL connection string.");
  }

  console.log(`Database host: ${parsedUrl.hostname}:${parsedUrl.port || "5432"}`);

  try {
    const addresses = await dns.lookup(parsedUrl.hostname, { all: true });
    console.log(`DNS resolved: ${addresses.map((entry) => entry.address).join(", ")}`);
  } catch (error) {
    throw new Error(`DNS lookup failed for ${parsedUrl.hostname}: ${error.message}`);
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
    prepare: false,
    connect_timeout: 15,
    max: 1,
  });

  try {
    const [databaseInfo] = await sql`
      SELECT current_database() AS database_name, current_user AS user_name
    `;

    console.log(`Connected database: ${databaseInfo.database_name}`);
    console.log(`Connected user: ${databaseInfo.user_name}`);

    const migrationsTableExists = await tableExists(sql, "_app_migrations");
    const migrationFiles = getMigrationFiles();

    if (!migrationsTableExists) {
      console.log(`Migration table: missing`);
      console.log(`Pending migration files: ${migrationFiles.length}`);
      return;
    }

    const appliedRows = await sql`SELECT name FROM public._app_migrations ORDER BY name`;
    const applied = new Set(appliedRows.map((row) => row.name));
    const pending = migrationFiles.filter((fileName) => !applied.has(fileName));

    console.log(`Migration table: present`);
    console.log(`Applied migrations: ${applied.size}`);
    console.log(`Pending migrations: ${pending.length}`);

    if (pending.length > 0) {
      console.log(`Next pending migration: ${pending[0]}`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run().catch((error) => {
  console.error("Database check failed:", error.message);
  process.exit(1);
});
