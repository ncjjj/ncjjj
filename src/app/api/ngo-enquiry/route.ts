import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import { findUserById } from "../../../db/queries/users";
import { findProfileByEmail, createProfile } from "../../../db/queries/profiles";
import { createConsultationRequest } from "../../../db/queries/consultationRequests";
import { emitConsultationRequestEvent, emitAdminEvent } from "../../../lib/consultationRequestSocket";
import { randomUUID } from "crypto";

const enquirySchema = z.object({
  serviceKey: z.string().trim().min(1, "Service reference is required."),
  serviceName: z.string().trim().min(1, "Service name is required."),
  address: z.string().trim().min(5, "Please enter your address."),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  fullName: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(6, "Enter a valid phone number."),
  firmName: z.string().trim().optional().or(z.literal("")),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid enquiry details.";
      return NextResponse.json({ message }, { status: 400 });
    }

    // If user is signed in, prefer their profile; otherwise create or reuse a profile for the provided email
    let profile = null;

    if (session?.user?.id) {
      const user = await findUserById(session.user.id);

      if (!user) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }

      profile = (await findProfileByEmail(user.email)) || (await createProfile({
        fullName: user.name,
        email: user.email,
        passwordHash: user.password,
        phone: user.mobileNumber,
        address: user.address,
        firmName: user.firmName,
        avatarPath: user.avatarPath || null,
        avatarUrl: user.avatarUrl || null,
      }));
    } else {
      // anonymous submission: try to find existing profile by email, otherwise create one
      const existing = await findProfileByEmail(parsed.data.email);

      if (existing) {
        profile = existing;
      } else {
        // create a lightweight profile record using a random password hash
        profile = await createProfile({
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          passwordHash: randomUUID(),
          phone: parsed.data.phone,
          address: parsed.data.address,
          firmName: parsed.data.firmName || null,
        });
      }
    }

    const enquiry = await createConsultationRequest({
      userId: profile.id,
      serviceName: parsed.data.serviceName,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      firmName: parsed.data.firmName || null,
      address: parsed.data.address,
      note: parsed.data.note?.trim() || null,
    });

    emitConsultationRequestEvent(enquiry.email, {
      type: "created",
      request: {
        id: enquiry.id,
        email: enquiry.email,
        status: enquiry.status,
        serviceName: enquiry.serviceName,
        fullName: enquiry.fullName,
        createdAt: enquiry.createdAt.toISOString(),
      },
    });

    emitAdminEvent("consultation-request-created", enquiry);

    return NextResponse.json({
      message: "Your request has been submitted. Our team will contact you shortly.",
      enquiry,
    });
  } catch (error: unknown) {
    console.error("[api/ngo-enquiry] POST failed", error);

    return NextResponse.json(
      { message: getErrorMessage(error) || "Unable to submit your request right now." },
      { status: 500 }
    );
  }
}
