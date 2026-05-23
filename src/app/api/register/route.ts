import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "../../../db/queries/users";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z
    .string()
    .trim()
    .email("A valid email is required.")
    .refine((e) => e.toLowerCase().endsWith("@gmail.com"), {
      message: "Only Gmail addresses are allowed.",
    }),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid registration data." },
        { status: 400 }
      );
    }


    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim().toLowerCase();

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { message: "An account already exists with this email." },
        { status: 409 }
      );
    }

    const user = await createUser({
      name,
      email,
      password: parsed.data.password,
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to register right now." },
      { status: 500 }
    );
  }
}