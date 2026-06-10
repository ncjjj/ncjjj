const fs = require("node:fs");
const path = require("node:path");

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

function isPlaceholder(value) {
  if (!value) {
    return true;
  }

  return (
    value.includes("[YOUR-PASSWORD]") ||
    value.includes("[PROJECT-REF]") ||
    value.includes("replace-me") ||
    value.includes("replace-with")
  );
}

function run() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");

  const required = [
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "APPWRITE_PROJECT_ID",
    "APPWRITE_API_KEY",
    "APPWRITE_BUCKET_ID",
  ];

  const missing = required.filter((key) => isPlaceholder(process.env[key]));

  if (missing.length > 0) {
    console.error("Missing or placeholder environment variables:");
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }

  console.log("Environment validation passed.");
}

run();
