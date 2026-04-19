import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
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

export async function POST(request) {
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
  } catch (error) {
    console.error("[api/register] failed", error);

    if (
      typeof error?.message === "string" &&
      error.message.includes("DATABASE_URL is not configured")
    ) {
      return NextResponse.json(
        {
          message:
            "Database is not configured. Set DATABASE_URL to a real PostgreSQL connection string before registering users.",
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
