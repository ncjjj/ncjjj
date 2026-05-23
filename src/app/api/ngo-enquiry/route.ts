import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import { findUserById } from "../../../db/queries/users";
import { findProfileByEmail, createProfile } from "../../../db/queries/profiles";
import { createConsultationRequest } from "../../../db/queries/consultationRequests";

const enquirySchema = z.object({
  serviceKey: z.string().trim().min(1, "Service reference is required."),
  serviceName: z.string().trim().min(1, "Service name is required."),
  address: z.string().trim().min(5, "Please enter your address."),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Please sign in to request this service." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid enquiry details.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const user = await findUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const profile = (await findProfileByEmail(user.email)) || (await createProfile({
      fullName: user.name,
      email: user.email,
      passwordHash: user.password,
      phone: user.mobileNumber,
      address: user.address,
      firmName: user.firmName,
      avatarPath: user.avatarPath || null,
      avatarUrl: user.avatarUrl || null,
    }));

    const enquiry = await createConsultationRequest({
      userId: profile.id,
      serviceName: parsed.data.serviceName,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      firmName: profile.firmName,
      address: parsed.data.address,
      note: parsed.data.note?.trim() || null,
    });

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
