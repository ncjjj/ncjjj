import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "../../../../db/index";
import { findUserByEmail, findUserByMobileNumber, createUser } from "../../../../db/queries/users";
import { findProfileByEmail, findProfileByPhone } from "../../../../db/queries/profiles";
import { findLatestValidPasswordResetToken, markPasswordResetTokenUsed } from "../../../../db/queries/passwordResetTokens";
import { encodeServiceAccess } from "../../../../lib/serviceAccess";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  otp: z.string().trim().min(6, "Email verification OTP must be 6 digits."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters."),
  mobileNumber: z.string().trim().optional().or(z.literal("")),
  panCard: z.string().trim().optional().or(z.literal("")),
  aadhaarCard: z.string().trim().min(12, "Aadhaar Card is mandatory."),
  dob: z.string().trim().optional().or(z.literal("")),
  gender: z.string().trim().optional().or(z.literal("")),
  citizen: z.string().trim().optional().or(z.literal("")),
  residentialStatus: z.string().trim().optional().or(z.literal("")),
  firmName: z.string().trim().optional().or(z.literal("")),
  aadhaarOtpVerified: z.boolean().optional().default(false),
  serviceAccess: z.array(z.string().trim()).optional().default([]),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Password and Confirm Password must match.",
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {

    const payload = await request.json();
    const parsed = createUserSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid user data." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const mobileNumber = parsed.data.mobileNumber?.trim() || "";

    // 1. Check unique email in users
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "An account already exists with this email." },
        { status: 409 }
      );
    }

    // 2. Check unique email in profiles
    const existingProfile = await findProfileByEmail(email);
    if (existingProfile) {
      return NextResponse.json(
        { message: "A profile already exists with this email." },
        { status: 409 }
      );
    }

    // 3. Check unique mobile number in users & profiles
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

    // 4. Verify OTP
    const resetToken = await findLatestValidPasswordResetToken(email);
    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid or expired OTP. Please request a new verification code." },
        { status: 400 }
      );
    }

    const otpValid = await bcrypt.compare(parsed.data.otp, resetToken.tokenHash);
    if (!otpValid) {
      return NextResponse.json(
        { message: "Invalid OTP code. Please check and try again." },
        { status: 400 }
      );
    }

    // 5. Mark OTP token as used
    await markPasswordResetTokenUsed(resetToken.id);

    const user = await createUser({
      name: parsed.data.name.trim(),
      email,
      password: parsed.data.password,
      mobileNumber: mobileNumber,
      panCard: parsed.data.panCard?.trim() || "",
      aadhaarCard: parsed.data.aadhaarCard?.trim() || "",
      dob: parsed.data.dob?.trim() || "",
      gender: parsed.data.gender?.trim() || "",
      citizen: parsed.data.citizen?.trim() || "",
      residentialStatus: parsed.data.residentialStatus?.trim() || "",
      firmName: parsed.data.firmName?.trim() || "",
      aadhaarOtpVerified: parsed.data.aadhaarOtpVerified,
      serviceAccess: encodeServiceAccess(parsed.data.serviceAccess),
    });

    return NextResponse.json(
      {
        message: "User credentials created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          serviceAccess: user.serviceAccess,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/admin/users] POST failed", error);
    return NextResponse.json(
      { message: "Unable to create user credentials right now." },
      { status: 500 }
    );
  }
}
