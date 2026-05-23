const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
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

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const databaseUrl = process.env.DATABASE_URL;

  if (isPlaceholderDatabaseUrl(databaseUrl)) {
    throw new Error("DATABASE_URL is not configured with a real PostgreSQL connection string.");
  }

  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase();
  const plainPassword = (process.env.ADMIN_PASSWORD || "Admin@124").trim();
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const adminId = process.env.ADMIN_ID || crypto.randomUUID();

  const sql = postgres(databaseUrl, {
    ssl: "require",
    prepare: false,
    connect_timeout: 15,
    max: 1,
  });

  console.log("\n🔐 Generated admin credentials\n");
  console.log("Admin ID:      ", adminId);
  console.log("Username:       ", adminUsername);
  console.log("Email:          ", adminEmail);
  console.log("Password:       ", plainPassword);
  console.log("Password Hash:  ", passwordHash);

  try {
    const [existing] = await sql`
      SELECT id
      FROM public.admin_accounts
      WHERE email = ${adminEmail}
      LIMIT 1
    `;

    if (existing) {
      await sql`
        UPDATE public.admin_accounts
        SET username = ${adminUsername},
            password_hash = ${passwordHash}
        WHERE id = ${existing.id}
      `;
      console.log("\nUpdated existing admin account in the database.");
    } else {
      await sql`
        INSERT INTO public.admin_accounts (id, username, email, password_hash)
        VALUES (${adminId}, ${adminUsername}, ${adminEmail}, ${passwordHash})
      `;
      console.log("\nCreated admin account in the database.");
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  console.log("\nUse admin@gmail.com with Admin@124 to sign in unless you override the env values.");
}

main().catch((error) => {
  console.error("\nError creating admin credentials:", error);
  process.exit(1);
});