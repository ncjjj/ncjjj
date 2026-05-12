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
  // Booking feature disabled: return empty slot list to callers.
  return [] as AppointmentSlotView[];
}

export async function listAppointmentSlotsForDate(slotDate: string) {
  return ensureAppointmentSlotsForDate(slotDate);
}

export async function listAppointmentsForUser(userId: string): Promise<AppointmentView[]> {
  // Booking feature disabled: return empty appointment list
  return [];
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
  // Booking removed - no selection allowed
  return null;
}

export async function confirmAppointmentSlot(userId: string, slotId: string, slotDate: string) {
  // Booking disabled - cannot confirm
  return null;
}

export async function cancelAppointmentSlot(_userId: string, _slotId: string, _slotDate: string) {
  // Booking removed - cancel not supported
  return null;
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