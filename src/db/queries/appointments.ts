import type { AppointmentSlotView, AppointmentView } from "../../types/domain";

export async function ensureAppointmentSlotsForDate(
  _slotDate: string
): Promise<AppointmentSlotView[]> {
  // Booking feature disabled: return empty slot list to callers.
  return [];
}

export async function listAppointmentSlotsForDate(slotDate: string) {
  return ensureAppointmentSlotsForDate(slotDate);
}

export async function listAppointmentsForUser(_userId: string): Promise<AppointmentView[]> {
  // Booking feature disabled: return empty appointment list.
  return [];
}

export async function selectAppointmentSlot(
  _userId: string,
  _slotId: string,
  _slotDate: string
) {
  // Booking removed - no selection allowed.
  return null;
}

export async function confirmAppointmentSlot(
  _userId: string,
  _slotId: string,
  _slotDate: string
) {
  // Booking disabled - cannot confirm.
  return null;
}

export async function cancelAppointmentSlot(
  _userId: string,
  _slotId: string,
  _slotDate: string
) {
  // Booking removed - cancel not supported.
  return null;
}
