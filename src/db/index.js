import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance;

function isPlaceholderDatabaseUrl(value) {
  return (
    !value ||
    value.includes("[YOUR-PASSWORD]") ||
    value.includes("[PROJECT-REF]") ||
    value.includes("replace-me")
  );
}

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  if (isPlaceholderDatabaseUrl(process.env.DATABASE_URL)) {
    throw new Error(
      "DATABASE_URL is not configured with a real PostgreSQL connection string."
    );
  }

  const client = postgres(process.env.DATABASE_URL, {
    ssl: "require",
    prepare: false,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
