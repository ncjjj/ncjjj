import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, hashAdminSessionToken } from "../../../../../lib/adminSession";
import { findActiveAdminSessionByTokenHash } from "../../../../../db/queries/admin";
import { getDatabaseErrorMessage, getDatabaseErrorStatus } from "../../../../../lib/dbErrors";

function readCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  const cookieValue = match?.[1];

  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

export async function GET(request: Request) {
  const token = readCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const tokenHash = await hashAdminSessionToken(token);
    const session = await findActiveAdminSessionByTokenHash(tokenHash);

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      admin: {
        id: session.adminId,
        username: session.username,
        email: session.email,
      },
    });
  } catch (error) {
    console.error("[api/admin/session/verify] GET failed", error);
    return NextResponse.json(
      { valid: false, message: getDatabaseErrorMessage(error) },
      { status: getDatabaseErrorStatus(error) }
    );
  }
}