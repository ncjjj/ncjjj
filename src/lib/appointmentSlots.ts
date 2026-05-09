export const appointmentSlotStartHour = 10;
export const appointmentSlotEndHour = 19;

export type AppointmentSlotDefinition = {
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toTimeValue(hour: number): string {
  return `${pad(hour)}:00:00`;
}

export function isWorkingAppointmentDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6;
}

export function formatAppointmentDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseAppointmentDate(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  return new Date(`${value}T00:00:00`);
}

export function getAppointmentSlotDefinitions(slotDate: string | Date): AppointmentSlotDefinition[] {
  const date = parseAppointmentDate(slotDate);

  if (Number.isNaN(date.getTime()) || !isWorkingAppointmentDay(date)) {
    return [];
  }

  const normalizedDate = formatAppointmentDate(date);
  const definitions: AppointmentSlotDefinition[] = [];

  for (let hour = appointmentSlotStartHour; hour < appointmentSlotEndHour; hour += 1) {
    definitions.push({
      slotDate: normalizedDate,
      slotStartTime: toTimeValue(hour),
      slotEndTime: toTimeValue(hour + 1),
    });
  }

  return definitions;
}

export function getNextWorkingAppointmentDates(limit = 14): string[] {
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < limit) {
    if (isWorkingAppointmentDay(cursor)) {
      dates.push(formatAppointmentDate(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}