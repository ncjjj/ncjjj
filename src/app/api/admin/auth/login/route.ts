import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "../../../../../lib/adminAuth";
import { validateAdminCredentials } from "../../../../../db/queries/adminAccounts";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    const username = parsed.data.username;
    const password = parsed.data.password;
    const valid = await validateAdminCredentials(username, password);

    if (!valid) {
      return NextResponse.json({ message: "Invalid admin credentials." }, { status: 401 });
    }

    const token = createAdminSessionToken(username);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[api/admin/auth/login] failed", error);
    return NextResponse.json({ message: "Unable to login." }, { status: 500 });
  }
}
