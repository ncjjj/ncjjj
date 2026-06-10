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

const REQUIRED_COLUMNS = {
  users: [
    "id",
    "name",
    "firm_name",
    "father_name",
    "mobile_number",
    "email",
    "address",
    "pan_card",
    "aadhaar_card",
    "dob",
    "gender",
    "citizen",
    "residential_status",
    "aadhaar_otp_verified",
    "service_access",
    "avatar_path",
    "avatar_url",
    "password",
    "password_plain",
    "created_at",
  ],
  profiles: [
    "id",
    "full_name",
    "email",
    "password_hash",
    "phone",
    "address",
    "firm_name",
    "father_name",
    "avatar_path",
    "avatar_url",
    "created_at",
  ],
};

async function getTableColumns(sql, tableName) {
  const rows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
  `;

  return new Set(rows.map((row) => row.column_name));
}

function reportMissingColumns(tableName, requiredColumns, existingColumns) {
  const missing = requiredColumns.filter((column) => !existingColumns.has(column));

  if (missing.length === 0) {
    console.log(`${tableName} columns: ok (${requiredColumns.length})`);
    return false;
  }

  console.log(`${tableName} columns: missing ${missing.length}`);
  console.log(`  ${missing.join(", ")}`);
  return true;
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
    connect_timeout: 30,
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
      console.log("Run: npm run db:migrate");
    }

    let schemaMismatch = false;

    for (const [tableName, columns] of Object.entries(REQUIRED_COLUMNS)) {
      if (!(await tableExists(sql, tableName))) {
        console.log(`${tableName} table: missing`);
        schemaMismatch = true;
        continue;
      }

      const existingColumns = await getTableColumns(sql, tableName);
      if (reportMissingColumns(tableName, columns, existingColumns)) {
        schemaMismatch = true;
      }
    }

    if (schemaMismatch) {
      console.log("Schema mismatch detected. Run: npm run db:migrate");
      process.exitCode = 2;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run().catch((error) => {
  console.error("Database check failed:", error.message);
  process.exit(1);
});
