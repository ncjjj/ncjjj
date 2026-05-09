import { and, asc, desc, eq, ne } from "drizzle-orm";
import { getDb } from "../index";
import { appointmentSlots, appointments, users } from "../schema";
import {
  formatAppointmentDate,
  getAppointmentSlotDefinitions,
  parseAppointmentDate,
} from "../../lib/appointmentSlots";
import type {
  AppointmentSlotStatus,
  AppointmentStatus,
  AppointmentSlotView,
  AppointmentView,
} from "../../types/domain";

type AppointmentSlotRow = {
  id: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: AppointmentSlotStatus;
  selectedByUserId: string | null;
  selectedAt: Date | null;
};

type AppointmentRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  slotId: string;
  slotDate: string;
  slotStartTime: string;
  status: AppointmentStatus;
  adminAction: string | null;
  adminRemarks: string | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
};

function toSlotView(row: AppointmentSlotRow): AppointmentSlotView {
  return {
    id: row.id,
    slotDate: row.slotDate,
    slotStartTime: row.slotStartTime,
    slotEndTime: row.slotEndTime,
    status: row.status,
    selectedByUserId: row.selectedByUserId,
    selectedAt: row.selectedAt ? row.selectedAt.toISOString() : null,
  };
}

function toAppointmentView(row: AppointmentRow): AppointmentView {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    userPhone: row.userPhone,
    slotId: row.slotId,
    slotDate: row.slotDate,
    slotStartTime: row.slotStartTime,
    status: row.status,
    adminAction: row.adminAction,
    adminRemarks: row.adminRemarks,
    confirmedAt: row.confirmedAt ? row.confirmedAt.toISOString() : null,
    cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function ensureAppointmentSlotsForDate(slotDate: string) {
  const db = getDb();
  const normalizedDate = formatAppointmentDate(parseAppointmentDate(slotDate));
  const definitions = getAppointmentSlotDefinitions(normalizedDate);

  if (definitions.length === 0) {
    return [] as AppointmentSlotView[];
  }

  const existingSlots = await db
    .select({
      id: appointmentSlots.id,
      slotDate: appointmentSlots.slotDate,
      slotStartTime: appointmentSlots.slotStartTime,
      slotEndTime: appointmentSlots.slotEndTime,
      status: appointmentSlots.status,
      selectedByUserId: appointmentSlots.selectedByUserId,
      selectedAt: appointmentSlots.selectedAt,
    })
    .from(appointmentSlots)
    .where(eq(appointmentSlots.slotDate, normalizedDate))
    .orderBy(asc(appointmentSlots.slotStartTime));

  if (existingSlots.length === 0) {
    await db.insert(appointmentSlots).values(
      definitions.map((definition) => ({
        slotDate: definition.slotDate,
        slotStartTime: definition.slotStartTime,
        slotEndTime: definition.slotEndTime,
        status: "available" as const,
        selectedByUserId: null,
        selectedAt: null,
      }))
    );

    const insertedSlots = await db
      .select({
        id: appointmentSlots.id,
        slotDate: appointmentSlots.slotDate,
        slotStartTime: appointmentSlots.slotStartTime,
        slotEndTime: appointmentSlots.slotEndTime,
        status: appointmentSlots.status,
        selectedByUserId: appointmentSlots.selectedByUserId,
        selectedAt: appointmentSlots.selectedAt,
      })
      .from(appointmentSlots)
      .where(eq(appointmentSlots.slotDate, normalizedDate))
      .orderBy(asc(appointmentSlots.slotStartTime));

    return insertedSlots.map(toSlotView);
  }

  return existingSlots.map(toSlotView);
}

export async function listAppointmentSlotsForDate(slotDate: string) {
  return ensureAppointmentSlotsForDate(slotDate);
}

export async function listAppointmentsForUser(userId: string): Promise<AppointmentView[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: appointments.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.mobileNumber,
      slotId: appointments.slotId,
      slotDate: appointments.slotDate,
      slotStartTime: appointments.slotStartTime,
      status: appointments.status,
      adminAction: appointments.adminAction,
      adminRemarks: appointments.adminRemarks,
      confirmedAt: appointments.confirmedAt,
      cancelledAt: appointments.cancelledAt,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .innerJoin(users, eq(appointments.userId, users.id))
    .where(eq(appointments.userId, userId))
    .orderBy(desc(appointments.createdAt));

  return rows.map(toAppointmentView);
}

export async function listAppointmentsForAdmin(): Promise<AppointmentView[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: appointments.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.mobileNumber,
      slotId: appointments.slotId,
      slotDate: appointments.slotDate,
      slotStartTime: appointments.slotStartTime,
      status: appointments.status,
      adminAction: appointments.adminAction,
      adminRemarks: appointments.adminRemarks,
      confirmedAt: appointments.confirmedAt,
      cancelledAt: appointments.cancelledAt,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .innerJoin(users, eq(appointments.userId, users.id))
    .orderBy(desc(appointments.createdAt));

  return rows.map(toAppointmentView);
}

export async function selectAppointmentSlot(userId: string, slotId: string, slotDate: string) {
  const db = getDb();
  const normalizedDate = formatAppointmentDate(parseAppointmentDate(slotDate));

  return db.transaction(async (tx) => {
    const [slot] = await tx
      .select()
      .from(appointmentSlots)
      .where(and(eq(appointmentSlots.id, slotId), eq(appointmentSlots.slotDate, normalizedDate)))
      .limit(1);

    if (!slot) {
      return null;
    }

    if (slot.status === "selected" && slot.selectedByUserId === userId) {
      return toSlotView(slot as AppointmentSlotRow);
    }

    if (slot.status !== "available") {
      return null;
    }

    const [updated] = await tx
      .update(appointmentSlots)
      .set({
        status: "selected",
        selectedByUserId: userId,
        selectedAt: new Date(),
      })
      .where(and(eq(appointmentSlots.id, slotId), eq(appointmentSlots.status, "available")))
      .returning();

    return updated ? toSlotView(updated as AppointmentSlotRow) : null;
  });
}

export async function confirmAppointmentSlot(userId: string, slotId: string, slotDate: string) {
  const db = getDb();
  const normalizedDate = formatAppointmentDate(parseAppointmentDate(slotDate));

  return db.transaction(async (tx) => {
    const [slot] = await tx
      .select()
      .from(appointmentSlots)
      .where(and(eq(appointmentSlots.id, slotId), eq(appointmentSlots.slotDate, normalizedDate)))
      .limit(1);

    if (!slot || slot.selectedByUserId !== userId || slot.status !== "selected") {
      return null;
    }

    const [existingAppointment] = await tx
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, userId),
          eq(appointments.slotId, slotId),
          ne(appointments.status, "cancelled")
        )
      )
      .limit(1);

    if (existingAppointment) {
      return toAppointmentView(existingAppointment as AppointmentRow);
    }

    const [created] = await tx
      .insert(appointments)
      .values({
        userId,
        slotId,
        slotDate: normalizedDate,
        slotStartTime: slot.slotStartTime,
        status: "pending",
        adminAction: null,
        adminRemarks: null,
        confirmedAt: null,
        cancelledAt: null,
      })
      .returning();

    await tx
      .update(appointmentSlots)
      .set({
        status: "confirmed",
      })
      .where(eq(appointmentSlots.id, slotId));

    return created ? toAppointmentView(created as AppointmentRow) : null;
  });
}

export async function cancelAppointmentSlot(userId: string, slotId: string, slotDate: string) {
  const db = getDb();
  const normalizedDate = formatAppointmentDate(parseAppointmentDate(slotDate));

  return db.transaction(async (tx) => {
    const [slot] = await tx
      .select()
      .from(appointmentSlots)
      .where(and(eq(appointmentSlots.id, slotId), eq(appointmentSlots.slotDate, normalizedDate)))
      .limit(1);

    if (!slot || slot.selectedByUserId !== userId) {
      return null;
    }

    const [appointment] = await tx
      .select()
      .from(appointments)
      .where(and(eq(appointments.userId, userId), eq(appointments.slotId, slotId)))
      .limit(1);

    if (appointment && appointment.status !== "cancelled") {
      await tx
        .update(appointments)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
        })
        .where(eq(appointments.id, appointment.id));
    }

    await tx
      .update(appointmentSlots)
      .set({
        status: "available",
        selectedByUserId: null,
        selectedAt: null,
      })
      .where(eq(appointmentSlots.id, slotId));

    return toSlotView({
      ...(slot as AppointmentSlotRow),
      status: "available",
      selectedByUserId: null,
      selectedAt: null,
    });
  });
}

export async function updateAppointmentStatusByAdmin(
  appointmentId: string,
  status: Exclude<AppointmentStatus, "pending" | "cancelled">,
  remarks?: string | null
) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        id: appointments.id,
        userId: appointments.userId,
        slotId: appointments.slotId,
        status: appointments.status,
      })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!existing || existing.status !== "pending") {
      return null;
    }

    const [updated] = await tx
      .update(appointments)
      .set({
        status,
        adminAction: status,
        adminRemarks: remarks ?? null,
        confirmedAt: status === "approved" ? new Date() : null,
        cancelledAt: status === "rejected" ? new Date() : null,
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (!updated) {
      return null;
    }

    if (status === "approved") {
      await tx
        .update(appointmentSlots)
        .set({
          status: "confirmed",
        })
        .where(eq(appointmentSlots.id, existing.slotId));
    } else if (status === "rejected") {
      await tx
        .update(appointmentSlots)
        .set({
          status: "available",
          selectedByUserId: null,
          selectedAt: null,
        })
        .where(eq(appointmentSlots.id, existing.slotId));
    }

    return toAppointmentView(updated as AppointmentRow);
  });
}