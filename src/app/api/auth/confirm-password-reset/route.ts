import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findLatestValidPasswordResetToken } from "../../../../db/queries/passwordResetTokens";
import { updateUserPasswordByEmail } from "../../../../db/queries/users";

const confirmSchema = z.object({
  email: z.string().trim().email("A valid email is required."),
  otp: z.string().trim().min(4, "OTP code is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = confirmSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid reset data." },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const resetToken = await findLatestValidPasswordResetToken(normalizedEmail);

    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid or expired OTP. Please request a new reset code." },
        { status: 400 }
      );
    }

    const otpValid = await bcrypt.compare(parsed.data.otp, resetToken.tokenHash);

    if (!otpValid) {
      return NextResponse.json(
        { message: "Invalid OTP code. Please check the code and try again." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
    await updateUserPasswordByEmail(normalizedEmail, hashedPassword);

    return NextResponse.json(
      { message: "Password reset successfully. You may now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/auth/confirm-password-reset] POST failed", error);
    return NextResponse.json(
      { message: "Unable to reset password right now." },
      { status: 500 }
    );
  }
}
