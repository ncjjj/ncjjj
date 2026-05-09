import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import {
  cancelAppointmentSlot,
  confirmAppointmentSlot,
  listAppointmentSlotsForDate,
  listAppointmentsForUser,
  selectAppointmentSlot,
} from "../../../db/queries/appointments";
import { getNextWorkingAppointmentDates } from "../../../lib/appointmentSlots";
import { emitToAdminRoom, emitToUserRoom } from "../../../lib/socketServer";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const actionSchema = z.object({
  action: z.enum(["select", "confirm", "cancel"]),
  slotId: z.string().uuid(),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type AppointmentSession = {
  user?: {
    id?: string;
  };
} | null;

function isUserAuthenticated(session: AppointmentSession) {
  return Boolean(session?.user?.id);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!isUserAuthenticated(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(searchParams);
    const date = parsed.success && parsed.data.date ? parsed.data.date : new Date().toISOString().slice(0, 10);

    const [slots, appointments] = await Promise.all([
      listAppointmentSlotsForDate(date),
      listAppointmentsForUser(session!.user!.id),
    ]);

    return NextResponse.json({
      dates: getNextWorkingAppointmentDates(),
      slots,
      appointments,
    });
  } catch (error) {
    console.error("[api/appointments] GET failed", error);
    return NextResponse.json({ message: "Unable to load appointments." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!isUserAuthenticated(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = actionSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid appointment payload.";
      return NextResponse.json({ message: issue }, { status: 400 });
    }

    const { action, slotId, slotDate } = parsed.data;
    const userId = session!.user!.id;

    if (action === "select") {
      const slot = await selectAppointmentSlot(userId, slotId, slotDate);

      if (!slot) {
        return NextResponse.json({ message: "Slot is no longer available." }, { status: 409 });
      }

      const occurredAt = new Date().toISOString();
      const eventPayload = {
        eventId: randomUUID(),
        slotId: slot.id,
        userId,
        slotDate: slot.slotDate,
        slotStartTime: slot.slotStartTime,
        status: slot.status,
        selectedByUserId: slot.selectedByUserId,
        occurredAt,
      };

      emitToAdminRoom("appointmentSlotUpdated", eventPayload);
      emitToUserRoom(userId, "appointmentSlotUpdated", eventPayload);

      return NextResponse.json({ slot });
    }

    if (action === "confirm") {
      const appointment = await confirmAppointmentSlot(userId, slotId, slotDate);

      if (!appointment) {
        return NextResponse.json({ message: "Unable to confirm slot." }, { status: 409 });
      }

      const occurredAt = new Date().toISOString();
      const appointmentPayload = {
        eventId: randomUUID(),
        appointmentId: appointment.id,
        slotId: appointment.slotId,
        userId,
        status: appointment.status,
        adminAction: appointment.adminAction,
        adminRemarks: appointment.adminRemarks,
        occurredAt,
      };

      emitToAdminRoom("appointmentUpdated", appointmentPayload);
      emitToUserRoom(userId, "appointmentUpdated", appointmentPayload);

      emitToAdminRoom("appointmentSlotUpdated", {
        eventId: randomUUID(),
        slotId: appointment.slotId,
        userId,
        slotDate: appointment.slotDate,
        slotStartTime: appointment.slotStartTime,
        status: "confirmed",
        selectedByUserId: userId,
        occurredAt,
      });
      emitToUserRoom(userId, "appointmentSlotUpdated", {
        eventId: randomUUID(),
        slotId: appointment.slotId,
        userId,
        slotDate: appointment.slotDate,
        slotStartTime: appointment.slotStartTime,
        status: "confirmed",
        selectedByUserId: userId,
        occurredAt,
      });

      return NextResponse.json({ appointment });
    }

    const slot = await cancelAppointmentSlot(userId, slotId, slotDate);

    if (!slot) {
      return NextResponse.json({ message: "Unable to cancel slot." }, { status: 409 });
    }

    const occurredAt = new Date().toISOString();
    const eventPayload = {
      eventId: randomUUID(),
      slotId: slot.id,
      userId,
      slotDate: slot.slotDate,
      slotStartTime: slot.slotStartTime,
      status: slot.status,
      selectedByUserId: slot.selectedByUserId,
      occurredAt,
    };

    emitToAdminRoom("appointmentSlotUpdated", eventPayload);
    emitToUserRoom(userId, "appointmentSlotUpdated", eventPayload);

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("[api/appointments] POST failed", error);
    return NextResponse.json({ message: "Unable to update appointment slot." }, { status: 500 });
  }
}
