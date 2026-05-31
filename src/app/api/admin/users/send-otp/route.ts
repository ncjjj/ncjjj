import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createPasswordResetToken } from "../../../../../db/queries/passwordResetTokens";
import { findUserByEmail, findUserByMobileNumber } from "../../../../../db/queries/users";
import { findProfileByEmail, findProfileByPhone } from "../../../../../db/queries/profiles";
import { sendEmailVerificationOtp } from "../../../../../lib/email";

const sendOtpSchema = z.object({
  email: z.string().trim().email("A valid email is required."),
  mobileNumber: z.string().trim().optional().or(z.literal("")),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = sendOtpSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid payload data." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const mobileNumber = parsed.data.mobileNumber?.trim() || "";

    // 1. Check unique email in users
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "An account already exists with this email." },
        { status: 409 }
      );
    }

    // 2. Check unique email in profiles
    const existingProfileByEmail = await findProfileByEmail(email);
    if (existingProfileByEmail) {
      return NextResponse.json(
        { message: "A profile already exists with this email." },
        { status: 409 }
      );
    }

    // 3. Check unique mobile number if provided
    if (mobileNumber) {
      const existingUserByMobile = await findUserByMobileNumber(mobileNumber);
      if (existingUserByMobile) {
        return NextResponse.json(
          { message: "An account already exists with this mobile number." },
          { status: 409 }
        );
      }

      const existingProfileByPhone = await findProfileByPhone(mobileNumber);
      if (existingProfileByPhone) {
        return NextResponse.json(
          { message: "A profile already exists with this phone number." },
          { status: 409 }
        );
      }
    }

    // 4. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // 5. Store OTP token in DB
    await createPasswordResetToken(email, tokenHash, expiresAt);

    // 6. Send OTP Email
    const emailResult = await sendEmailVerificationOtp({
      to: email,
      otp,
    });

    if (!emailResult.sent) {
      return NextResponse.json(
        { message: emailResult.reason || "Unable to send verification OTP email." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Verification OTP has been sent successfully to the email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/admin/users/send-otp] POST failed", error);
    return NextResponse.json(
      { message: "Unable to send verification OTP right now." },
      { status: 500 }
    );
  }
}
