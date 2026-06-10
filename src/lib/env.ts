const PLACEHOLDER_PATTERNS = ["[YOUR-PASSWORD]", "[PROJECT-REF]", "replace-me", "replace-with"];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return PLACEHOLDER_PATTERNS.some((pattern) => value.includes(pattern));
}

export interface RuntimeEnvCheck {
  ok: boolean;
  missing: string[];
  warnings: string[];
}

export function validateRuntimeEnv(): RuntimeEnvCheck {
  const required = [
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "APPWRITE_PROJECT_ID",
    "APPWRITE_API_KEY",
    "APPWRITE_BUCKET_ID",
  ] as const;

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of required) {
    const value = process.env[key];
    if (isPlaceholder(value)) {
      missing.push(key);
    }
  }

  if (isPlaceholder(process.env.GMAIL_USER) || isPlaceholder(process.env.GMAIL_APP_PASSWORD)) {
    warnings.push("Gmail OTP email is not configured. Password reset and admin OTP flows may fail.");
  }

  if (!process.env.FIELD_ENCRYPTION_KEY && isPlaceholder(process.env.NEXTAUTH_SECRET)) {
    warnings.push("FIELD_ENCRYPTION_KEY is not set. Falling back to NEXTAUTH_SECRET for field encryption.");
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

export function getPublicAppUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}
