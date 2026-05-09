import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const DEFAULT_ADMIN_USERNAME = "Admin";
export const DEFAULT_ADMIN_PASSWORD = "Admin@2004";

const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function getAdminAuthSecret(): string {
  return (
    process.env.ADMIN_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-admin-secret-change-me"
  );
}

function getSignature(payload: string): string {
  return createHmac("sha256", getAdminAuthSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken(username: string): string {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const payload = `${username}:${expiresAt}`;
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
  const signature = getSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | null | undefined): {
  username: string;
} | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = getSignature(encodedPayload);

  if (expectedSignature.length !== signature.length) {
    return null;
  }

  const validSignature = timingSafeEqual(
    Buffer.from(expectedSignature, "utf8"),
    Buffer.from(signature, "utf8")
  );

  if (!validSignature) {
    return null;
  }

  const decodedPayload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const [username, expiresAtRaw] = decodedPayload.split(":");
  const expiresAt = Number(expiresAtRaw);

  if (!username || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  return { username };
}

export function getAdminSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}
