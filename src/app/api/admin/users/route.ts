import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "../../../../db/index";
import { users, profiles } from "../../../../db/schema";
import { findUserByEmail, findUserByMobileNumber, createUser } from "../../../../db/queries/users";
import { findProfileByEmail, findProfileByPhone } from "../../../../db/queries/profiles";
import { findLatestValidPasswordResetToken, markPasswordResetTokenUsed } from "../../../../db/queries/passwordResetTokens";
import { encodeServiceAccess } from "../../../../lib/serviceAccess";
import { emitAdminEvent } from "../../../../lib/consultationRequestSocket";
import { getDatabaseErrorMessage, getDatabaseErrorStatus } from "../../../../lib/dbErrors";
import { encryptSensitiveField } from "../../../../lib/fieldEncryption";
import { requireAdminSession } from "../../../../lib/requireAdmin";

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
  fatherName: z.string().trim().optional().or(z.literal("")),
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

const updateUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits."),
  firmName: z.string().trim().nullable().optional(),
  fatherName: z.string().trim().nullable().optional(),
  panCard: z.string().trim().nullable().optional(),
  aadhaarCard: z.string().trim().nullable().optional(),
  dob: z.string().trim().nullable().optional(),
  gender: z.string().trim().nullable().optional(),
  citizen: z.string().trim().nullable().optional(),
  residentialStatus: z.string().trim().nullable().optional(),
  password: z.string().trim().optional().or(z.literal("")),
  serviceAccess: z.array(z.string().trim()).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const adminGuard = await requireAdminSession(request);
  if (adminGuard.response) {
    return adminGuard.response;
  }

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

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "An account already exists with this email." },
        { status: 409 }
      );
    }

    const existingProfile = await findProfileByEmail(email);
    if (existingProfile) {
      return NextResponse.json(
        { message: "A profile already exists with this email." },
        { status: 409 }
      );
    }

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

    await markPasswordResetTokenUsed(resetToken.id);

    const user = await createUser({
      name: parsed.data.name.trim(),
      email,
      password: parsed.data.password,
      mobileNumber: mobileNumber,
      panCard: parsed.data.panCard?.trim() || "",
      aadhaarCard: parsed.data.aadhaarCard?.trim() || "",
      dob: parsed.data.dob?.trim() || "",
      fatherName: parsed.data.fatherName?.trim() || "",
      gender: parsed.data.gender?.trim() || "",
      citizen: parsed.data.citizen?.trim() || "",
      residentialStatus: parsed.data.residentialStatus?.trim() || "",
      firmName: parsed.data.firmName?.trim() || "",
      aadhaarOtpVerified: parsed.data.aadhaarOtpVerified,
      serviceAccess: encodeServiceAccess(parsed.data.serviceAccess),
    });

    emitAdminEvent("user-created", {
      id: user.id,
      name: user.name,
      email: user.email,
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
      { message: getDatabaseErrorMessage(error) || "Unable to create user credentials right now." },
      { status: getDatabaseErrorStatus(error) }
    );
  }
}

export async function PATCH(request: Request) {
  const adminGuard = await requireAdminSession(request);
  if (adminGuard.response) {
    return adminGuard.response;
  }

  try {
    const payload = await request.json();
    const parsed = updateUserSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid user data." },
        { status: 400 }
      );
    }

    const {
      id,
      fullName,
      email,
      phone,
      firmName,
      fatherName,
      panCard,
      aadhaarCard,
      dob,
      gender,
      citizen,
      residentialStatus,
      password,
      serviceAccess,
    } = parsed.data;

    const db = getDb();

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ message: "Client profile not found." }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      let hashedPassword = "";
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      await tx
        .update(profiles)
        .set({
          fullName,
          email,
          phone,
          firmName: firmName || null,
          fatherName: fatherName || null,
          ...(hashedPassword && { passwordHash: hashedPassword }),
        })
        .where(eq(profiles.id, id));

      const [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1);

      if (existingUser) {
        const encoded = serviceAccess ? encodeServiceAccess(serviceAccess) : existingUser.serviceAccess;

        await tx
          .update(users)
          .set({
            name: fullName,
            email,
            mobileNumber: phone,
            firmName: firmName || null,
            fatherName: fatherName || null,
            panCard: panCard || null,
            aadhaarCard: aadhaarCard || null,
            dob: dob || null,
            gender: gender || null,
            citizen: citizen || null,
            residentialStatus: residentialStatus || null,
            serviceAccess: encoded,
            ...(hashedPassword && {
              password: hashedPassword,
              passwordPlain: encryptSensitiveField(password),
            }),
          })
          .where(eq(users.id, existingUser.id));
      }
    });

    return NextResponse.json({ message: "Client profile updated successfully." });
  } catch (error) {
    console.error("[api/admin/users] PATCH failed", error);
    return NextResponse.json(
      { message: getDatabaseErrorMessage(error) || "Unable to update client profile right now." },
      { status: getDatabaseErrorStatus(error) }
    );
  }
}
