// Appointment slots library stubbed because booking feature removed.
// Keep exports so imports don't break elsewhere in the codebase.

export const appointmentSlotStartHour = 10;
export const appointmentSlotEndHour = 19;

export type AppointmentSlotDefinition = {
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
};

export function isWorkingAppointmentDay(_date: Date): boolean {
  return false;
}

export function formatAppointmentDate(_date: Date): string {
  return "";
}

export function parseAppointmentDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  return new Date(`${value}T00:00:00`);
}

export function getAppointmentSlotDefinitions(_slotDate: string | Date): AppointmentSlotDefinition[] {
  return [];
}

export function isDateInAvailableMonths(_date: Date): boolean {
  return false;
}

export function getNextWorkingAppointmentDates(_limit = 7): string[] {
  return [];
}
