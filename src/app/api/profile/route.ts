import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import { findUserById } from "../../../db/queries/users";
import { updateUserProfile } from "../../../db/queries/users";

const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
    email: z.string().trim().email("Please enter a valid email address."),
    phone: z.string().trim().optional(),
    mobileNumber: z.string().trim().optional(),
    firmName: z.string().trim().max(120).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const rawPhone = (data.phone || data.mobileNumber || "").trim();

    if (!rawPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required.",
      });
      return;
    }

    if (rawPhone.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number must be at least 6 characters.",
      });
      return;
    }

    if (rawPhone.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is too long.",
      });
    }
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
      return NextResponse.json({ message: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        firmName: user.firmName || "",
        mobileNumber: user.mobileNumber,
        avatarPath: user.avatarPath,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[api/profile] fetch failed", error);

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        mobileNumber: session.user.mobileNumber || "",
        avatarPath: session.user.avatarPath || null,
        avatarUrl: session.user.avatarUrl || null,
        role: session.user.role,
      },
      warning: "Profile database read failed. Showing your latest session details.",
    });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = profileUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid profile details.";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const normalizedPhone = (parsed.data.phone || parsed.data.mobileNumber || "").trim();

    const updatedUser = await updateUserProfile(session.user.id, {
      name: parsed.data.name,
      email: normalizedEmail,
      mobileNumber: normalizedPhone,
      firmName: parsed.data.firmName || null,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        firmName: updatedUser.firmName || "",
        mobileNumber: updatedUser.mobileNumber,
        avatarPath: updatedUser.avatarPath,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
      },
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const isDuplicateEmail =
      message.includes("users_email_unique") ||
      message.includes("duplicate key") ||
      message.includes("unique constraint");

    if (isDuplicateEmail) {
      return NextResponse.json(
        { message: "This email is already in use." },
        { status: 409 }
      );
    }

    console.error("[api/profile] update failed", error);
    return NextResponse.json(
      { message: "Unable to update profile right now." },
      { status: 500 }
    );
  }
}
