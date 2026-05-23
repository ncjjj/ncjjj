import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createPasswordResetToken } from "../../../../db/queries/passwordResetTokens";
import { findUserByEmail } from "../../../../db/queries/users";
import { sendPasswordResetOtpEmail } from "../../../../lib/email";

const requestSchema = z.object({
  email: z.string().trim().email("A valid email is required."),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = requestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json({ message: "Email not found." }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await createPasswordResetToken(normalizedEmail, tokenHash, expiresAt);

    const emailResult = await sendPasswordResetOtpEmail({
      to: normalizedEmail,
      otp,
    });

    if (!emailResult.sent) {
      return NextResponse.json(
        { message: emailResult.reason || "Unable to send password reset OTP." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Password reset OTP has been sent to your registered email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/auth/request-password-reset] POST failed", error);
    return NextResponse.json(
      { message: "Unable to process password reset right now." },
      { status: 500 }
    );
  }
}
