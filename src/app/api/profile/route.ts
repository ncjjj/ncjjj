import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import { findUserById, updateUserProfile } from "../../../db/queries/users";
import {
  findProfileByEmail,
  updateProfileByEmail,
} from "../../../db/queries/profiles";
import { emitAdminEvent, emitUserEvent } from "../../../lib/consultationRequestSocket";
import { getDatabaseErrorMessage, getDatabaseErrorStatus } from "../../../lib/dbErrors";

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  mobileNumber: z.string().trim().min(6, "A valid phone number is required.").optional(),
  phone: z.string().trim().min(6, "A valid phone number is required.").optional(),
  firmName: z.string().trim().optional().nullable(),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await findUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const profile = (await findProfileByEmail(user.email)) || null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: profile?.fullName || user.name,
        email: profile?.email || user.email,
        firmName: profile?.firmName ?? user.firmName,
        fatherName: profile?.fatherName ?? user.fatherName ?? "",
        mobileNumber: profile?.phone || user.mobileNumber,
        address: user.address || "",
        panCard: user.panCard || "",
        aadhaarCard: user.aadhaarCard || "",
        dob: user.dob || "",
        gender: user.gender || "",
        citizen: user.citizen || "",
        residentialStatus: user.residentialStatus || "",
        aadhaarOtpVerified: user.aadhaarOtpVerified || false,
        serviceAccess: user.serviceAccess || "",
        createdAt: user.createdAt?.toISOString() || "",
      },
    });
  } catch (error: unknown) {
    console.error("[api/profile] GET failed", error);
    return NextResponse.json(
      { message: getDatabaseErrorMessage(error) || getErrorMessage(error) || "Unable to load profile." },
      { status: getDatabaseErrorStatus(error) }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid profile data.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const mobileNumber = (parsed.data.mobileNumber || parsed.data.phone || "").replace(/\s+/g, "").trim();
    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const existingUser = await findUserById(session.user.id);

    if (!existingUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const updatedUser = await updateUserProfile(session.user.id, {
      name: parsed.data.name,
      email: normalizedEmail,
      mobileNumber,
      firmName: parsed.data.firmName?.trim() || null,
    });

    await updateProfileByEmail(existingUser.email, {
      fullName: parsed.data.name,
      email: normalizedEmail,
      phone: mobileNumber,
      firmName: parsed.data.firmName?.trim() || null,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    emitAdminEvent("user-profile-updated", {
      userId: session.user.id,
      email: normalizedEmail,
    });

    if (session.user.email) {
      emitUserEvent(session.user.email, "profile-updated", {
        userId: session.user.id,
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    console.error("[api/profile] PATCH failed", error);
    return NextResponse.json(
      { message: getDatabaseErrorMessage(error) || getErrorMessage(error) || "Unable to update profile." },
      { status: getDatabaseErrorStatus(error) }
    );
  }
}
