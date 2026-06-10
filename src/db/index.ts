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

  const poolSize = Number(process.env.DATABASE_POOL_SIZE || 5);

  const client = postgres(databaseUrl, {
    ssl: "require",
    prepare: false,
    connect_timeout: 30,
    idle_timeout: 20,
    max_lifetime: 60 * 10,
    max: Number.isFinite(poolSize) && poolSize > 0 ? poolSize : 5,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
