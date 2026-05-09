import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { authOptions } from "../../../../lib/auth";
import {
  createConsultantRegistration,
  listConsultantRegistrationsForUser,
} from "../../../../db/queries/consultantRegistrations";
import { emitToAdminRoom } from "../../../../lib/socketServer";

const bookingSchema = z.object({
  consultantName: z.string().trim().min(2).max(120),
  preferredDateTime: z.string().datetime(),
  notes: z.string().trim().max(800).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = bookingSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid booking payload.";
      return NextResponse.json({ message: issue }, { status: 400 });
    }

    const preferredAt = new Date(parsed.data.preferredDateTime);

    if (Number.isNaN(preferredAt.getTime())) {
      return NextResponse.json({ message: "Invalid preferred date/time." }, { status: 400 });
    }

    const created = await createConsultantRegistration({
      userId: session.user.id,
      consultantName: parsed.data.consultantName,
      preferredAt,
      notes: parsed.data.notes ?? null,
    });

    if (!created) {
      return NextResponse.json({ message: "Unable to save booking request." }, { status: 500 });
    }

    emitToAdminRoom("consultantRegistered", {
      eventId: randomUUID(),
      registrationId: created.id,
      userId: created.userId,
      status: created.status,
      occurredAt: created.createdAt.toISOString(),
    });

    return NextResponse.json({
      message: "Book call request accepted",
      userId: session.user.id,
      registrationId: created.id,
    });
  } catch (error) {
    console.error("[actions/book-call] POST failed", error);
    return NextResponse.json(
      { message: "Unable to process booking request right now." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const registrations = await listConsultantRegistrationsForUser(session.user.id);

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("[actions/book-call] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load booking registrations right now." },
      { status: 500 }
    );
  }
}
