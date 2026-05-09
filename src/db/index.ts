import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: PostgresJsDatabase<typeof schema> | null = null;

function isPlaceholderDatabaseUrl(value: string | undefined): boolean {
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

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || isPlaceholderDatabaseUrl(databaseUrl)) {
    throw new Error(
      "DATABASE_URL is not configured with a real PostgreSQL connection string."
    );
  }

  const client = postgres(databaseUrl, {
    ssl: "require",
    prepare: false,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
