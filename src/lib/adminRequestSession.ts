import { ADMIN_SESSION_COOKIE, hashAdminSessionToken } from "./adminSession";
import { findActiveAdminSessionByTokenHash, type AdminSessionWithAdmin } from "../db/queries/admin";

function readCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  const cookieValue = match?.[1];

  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

export async function getAdminSessionFromRequest(
  request: Request
): Promise<AdminSessionWithAdmin | null> {
  const token = readCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);

  if (!token) {
    return null;
  }

  const tokenHash = await hashAdminSessionToken(token);
  return findActiveAdminSessionByTokenHash(tokenHash);
}
