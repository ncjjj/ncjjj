import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "../../../../db/index";
import { adminAccounts } from "../../../../db/schema";

export const dynamic = "force-dynamic";

import { eq, ne, and } from "drizzle-orm";
import {
  ADMIN_SESSION_COOKIE,
  hashAdminSessionToken,
} from "../../../../lib/adminSession";
import {
  findActiveAdminSessionByTokenHash,
  updateAdminAccount,
} from "../../../../db/queries/admin";

function readCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  const cookieValue = match?.[1];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

async function getAuthenticatedAdmin(request: Request) {
  const cookieStore = cookies();
  let token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || null;
  if (!token) {
    token = readCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  }

  if (!token) {
    return null;
  }

  const tokenHash = await hashAdminSessionToken(token);
  const session = await findActiveAdminSessionByTokenHash(tokenHash);
  if (!session) {
    return null;
  }

  const db = getDb();
  const [admin] = await db
    .select()
    .from(adminAccounts)
    .where(eq(adminAccounts.id, session.adminId))
    .limit(1);

  return admin || null;
}

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("[api/admin/profile] GET failed", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { username, email, password, currentPassword } = payload;

    if (!currentPassword) {
      return NextResponse.json(
        { message: "Current password is required to save changes." },
        { status: 400 }
      );
    }

    // Verify current password first
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json(
        { message: "Incorrect current password." },
        { status: 400 }
      );
    }

    const cleanUsername = username?.trim().toLowerCase();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanUsername) {
      return NextResponse.json({ message: "Username cannot be empty." }, { status: 400 });
    }
    if (!cleanEmail) {
      return NextResponse.json({ message: "Email cannot be empty." }, { status: 400 });
    }

    const db = getDb();

    // Check if username already exists for a different admin account
    if (cleanUsername !== admin.username) {
      const [existingUsername] = await db
        .select()
        .from(adminAccounts)
        .where(
          and(
            eq(adminAccounts.username, cleanUsername),
            ne(adminAccounts.id, admin.id)
          )
        )
        .limit(1);

      if (existingUsername) {
        return NextResponse.json({ message: "Username is already in use." }, { status: 400 });
      }
    }

    // Check if email already exists for a different admin account
    if (cleanEmail !== admin.email) {
      const [existingEmail] = await db
        .select()
        .from(adminAccounts)
        .where(
          and(
            eq(adminAccounts.email, cleanEmail),
            ne(adminAccounts.id, admin.id)
          )
        )
        .limit(1);

      if (existingEmail) {
        return NextResponse.json({ message: "Email is already in use." }, { status: 400 });
      }
    }

    let newPasswordHash: string | undefined;
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "New password must be at least 6 characters." },
          { status: 400 }
        );
      }
      newPasswordHash = await bcrypt.hash(password, 10);
    }

    await updateAdminAccount(admin.id, {
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: newPasswordHash,
    });

    return NextResponse.json({
      message: "Admin profile updated successfully.",
      admin: {
        id: admin.id,
        username: cleanUsername,
        email: cleanEmail,
      },
    });
  } catch (error) {
    console.error("[api/admin/profile] PUT failed", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
