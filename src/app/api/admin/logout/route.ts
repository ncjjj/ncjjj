import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, hashAdminSessionToken } from "../../../../lib/adminSession";
import { revokeAdminSessionByTokenHash } from "../../../../db/queries/admin";

function readCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  const cookieValue = match?.[1];

  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

export async function POST(request: Request) {
  const token = readCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);

  if (token) {
    try {
      const tokenHash = await hashAdminSessionToken(token);
      await revokeAdminSessionByTokenHash(tokenHash);
    } catch (error) {
      console.error("[api/admin/logout] session revoke failed", error);
    }
  }

  const response = NextResponse.json({ message: "Signed out." });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
