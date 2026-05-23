const fs = require("node:fs");
const path = require("node:path");
const postgres = require("postgres");

function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvFile(".env.local");
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const migrationPath = path.resolve(process.cwd(), "drizzle/0019_ngo_service_enquiries.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  const statements = migrationSql
    .split(/-->\s*statement-breakpoint/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.unsafe(statement);
  }

  await sql.end();
  console.log("ngo_service_enquiries table is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
