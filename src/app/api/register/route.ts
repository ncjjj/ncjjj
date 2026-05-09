import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "../../../db/queries/users";

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    mobileNumber: z
      .string()
      .trim()
      .min(7, "Mobile number is required")
      .max(20, "Mobile number is too long")
      .regex(/^[0-9+\-()\s]+$/, "Mobile number must contain only valid phone characters"),
    email: z.string().trim().email(),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
  })
  .strict();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    const newUser = await createUser({
      name: parsed.data.name,
      mobileNumber: parsed.data.mobileNumber,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    if (!newUser) {
      return NextResponse.json(
        { message: "Unable to create user." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          mobileNumber: newUser.mobileNumber,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[api/register] failed", error);

    const errorMessage = getErrorMessage(error);

    if (
      errorMessage.includes("DATABASE_URL is not configured") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("connection timeout")
    ) {
      return NextResponse.json(
        {
          message:
            "Database is unavailable. Check DATABASE_URL and run the database migration before registering users.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Unable to complete registration request." },
      { status: 500 }
    );
  }
}
