/**
 * Helper script to list all files in Supabase bucket
 * Useful for debugging and understanding bucket structure
 */

const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

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

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function listBucketContents() {
  try {
    // Load environment
    loadEnvFile(".env.local");
    loadEnvFile(".env");

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "profile-assets";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    console.log("\n📦 Supabase Bucket Inspector\n");
    console.log(`Bucket: ${bucket}`);
    console.log(`URL: ${supabaseUrl}\n`);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // List with different prefixes
    const prefixes = ["", "documents/", "yearly-documents/", "permanent-documents/", "avatars/", "profile-assets/"];

    for (const prefix of prefixes) {
      console.log(`\n🔍 Listing files${prefix ? ` in "${prefix}"` : " (root)"}`);
      console.log("─".repeat(60));

      try {
        const { data, error } = await supabase.storage.from(bucket).list(prefix || undefined, {
          limit: 1000,
          sortBy: { column: "name", order: "asc" },
        });

        if (error) {
          console.log(`  ✗ Error: ${error.message}`);
          continue;
        }

        const files = (data || []).filter((item) => item.id !== null);

        if (files.length === 0) {
          console.log("  (No files found)");
        } else {
          console.log(`  Found ${files.length} file(s):\n`);
          for (const file of files) {
            const size = file.metadata?.size
              ? `${(file.metadata.size / 1024).toFixed(2)} KB`
              : "unknown size";
            const date = file.updated_at ? new Date(file.updated_at).toLocaleDateString() : "unknown date";
            console.log(`    📄 ${file.name}`);
            console.log(`       Size: ${size}, Updated: ${date}`);
            console.log(`       ID: ${file.id}\n`);
          }
        }
      } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
      }
    }

    console.log("\n✅ Bucket inspection complete\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

listBucketContents();
