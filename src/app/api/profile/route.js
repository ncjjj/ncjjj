import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import { updateUserProfile } from "../../../db/queries/users";

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number must be at least 6 characters.")
    .max(20, "Phone number is too long."),
});

export async function PATCH(request) {
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

    const updatedUser = await updateUserProfile(session.user.id, {
      name: parsed.data.name,
      email: normalizedEmail,
      mobileNumber: parsed.data.phone,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        avatarPath: updatedUser.avatarPath,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    const message = String(error?.message || "");
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
