import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  hashAdminSessionToken,
} from "../../../../lib/adminSession";
import {
  createAdminSessionRecord,
  findAdminByIdentifier,
} from "../../../../db/queries/admin";

const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, "Username or email is required."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid login details." },
        { status: 400 }
      );
    }

    const identifier = parsed.data.usernameOrEmail.trim().toLowerCase();
    const admin = await findAdminByIdentifier(identifier);

    if (!admin) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    const passwordValid = await bcrypt.compare(parsed.data.password, admin.passwordHash);

    if (!passwordValid) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    const token = await createAdminSessionToken();
    const tokenHash = await hashAdminSessionToken(token);
    const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000);

    await createAdminSessionRecord({
      adminId: admin.id,
      tokenHash,
      expiresAt,
    });

    const response = NextResponse.json({
      message: "Admin login successful.",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[api/admin/login] POST failed", error);
    return NextResponse.json(
      { message: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
