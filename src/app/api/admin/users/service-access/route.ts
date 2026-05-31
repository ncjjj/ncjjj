import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../../../../../db/index";
import {
  findUserByEmail,
  updateUserServiceAccessByEmail,
} from "../../../../../db/queries/users";
import { encodeServiceAccess } from "../../../../../lib/serviceAccess";
import { emitAdminEvent, emitUserEvent } from "../../../../../lib/consultationRequestSocket";

const assignServiceAccessSchema = z.object({
  email: z.string().trim().email("A valid email is required."),
  serviceAccess: z.array(z.string().trim()).default([]),
});

export async function POST(request: Request) {
  try {

    const payload = await request.json();
    const parsed = assignServiceAccessSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid service data." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const encoded = encodeServiceAccess(parsed.data.serviceAccess);
    const updated = await updateUserServiceAccessByEmail(email, encoded);

    if (!updated) {
      return NextResponse.json({ message: "Unable to update service access." }, { status: 500 });
    }

    emitAdminEvent("user-service-access-updated", {
      id: updated.id,
      email: updated.email,
      serviceAccess: updated.serviceAccess,
    });

    emitUserEvent(updated.email, "service-access-updated", {
      serviceAccess: updated.serviceAccess,
    });

    return NextResponse.json({
      message: "Service access updated successfully.",
      user: {
        id: updated.id,
        email: updated.email,
        serviceAccess: updated.serviceAccess,
      },
    });
  } catch (error) {
    console.error("[api/admin/users/service-access] POST failed", error);
    return NextResponse.json({ message: "Unable to update service access right now." }, { status: 500 });
  }
}
