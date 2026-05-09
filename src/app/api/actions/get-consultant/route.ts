import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authOptions } from "../../../../lib/auth";
import { createConsultantRegistration } from "../../../../db/queries/consultantRegistrations";
import { emitToAdminRoom } from "../../../../lib/socketServer";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const created = await createConsultantRegistration({ userId: session.user.id });

    if (!created) {
      return NextResponse.json(
        { message: "Unable to create consultant registration." },
        { status: 500 }
      );
    }

    emitToAdminRoom("consultantRegistered", {
      eventId: randomUUID(),
      registrationId: created.id,
      userId: created.userId,
      status: created.status,
      occurredAt: created.createdAt.toISOString(),
    });

    return NextResponse.json({
      message: "Consultant request accepted",
      userId: session.user.id,
      registrationId: created.id,
    });
  } catch (error) {
    console.error("[actions/get-consultant] POST failed", error);
    return NextResponse.json(
      { message: "Unable to process consultant request right now." },
      { status: 500 }
    );
  }
}
