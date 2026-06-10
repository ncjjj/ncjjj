interface PostgresLikeError {
  code?: string;
  message?: string;
  cause?: unknown;
}

function unwrapError(error: unknown): PostgresLikeError | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const record = error as PostgresLikeError;

  if (record.cause && typeof record.cause === "object") {
    return record.cause as PostgresLikeError;
  }

  return record;
}

export function isDatabaseConnectionError(error: unknown): boolean {
  const root = unwrapError(error);
  const code = String(root?.code || "").toUpperCase();
  const message = String(root?.message || (error instanceof Error ? error.message : "")).toLowerCase();

  return (
    code === "CONNECT_TIMEOUT" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "57P01" ||
    code === "08006" ||
    code === "08001" ||
    message.includes("connect_timeout") ||
    message.includes("connection terminated") ||
    message.includes("failed to connect") ||
    message.includes("fetch failed")
  );
}

export function isMissingDatabaseColumnError(error: unknown): boolean {
  const root = unwrapError(error);
  const code = String(root?.code || "");
  const message = String(root?.message || (error instanceof Error ? error.message : "")).toLowerCase();

  return (
    code === "42703" ||
    message.includes("column") && message.includes("does not exist")
  );
}

export function getDatabaseErrorMessage(error: unknown): string {
  if (isDatabaseConnectionError(error)) {
    return "Database connection timed out. Check DATABASE_URL and that your Supabase project is active.";
  }

  if (isMissingDatabaseColumnError(error)) {
    return "Database schema is out of date. Run npm run db:migrate and redeploy.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "A database error occurred.";
}

export function getDatabaseErrorStatus(error: unknown): number {
  if (isDatabaseConnectionError(error)) {
    return 503;
  }

  if (isMissingDatabaseColumnError(error)) {
    return 500;
  }

  return 500;
}
