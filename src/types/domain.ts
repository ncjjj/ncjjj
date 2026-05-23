export type AppointmentSlotStatus = "available" | "selected" | "confirmed";
export type AppointmentStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ApiMessageResponse {
  message: string;
}

export type ConsultantRegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "contacted"
  | "closed";

export interface ConsultantRegistrationView {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  consultantName: string | null;
  preferredAt: Date | null;
  notes: string | null;
  status: ConsultantRegistrationStatus;
  createdAt: Date;
}

export interface ConsultantRegisteredRealtimeEvent {
  eventId: string;
  registrationId: string;
  userId: string;
  status: ConsultantRegistrationStatus;
  occurredAt: string;
}

export interface ConsultantStatusUpdatedRealtimeEvent {
  eventId: string;
  registrationId: string;
  userId: string;
  status: ConsultantRegistrationStatus;
  occurredAt: string;
}

export interface AppointmentSlotView {
  id: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: AppointmentSlotStatus;
  selectedByUserId: string | null;
  selectedAt: string | null;
}

export interface AppointmentView {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  slotId: string;
  slotDate: string;
  slotStartTime: string;
  status: AppointmentStatus;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface AppointmentSlotUpdatedRealtimeEvent {
  eventId: string;
  slotId: string;
  userId: string | null;
  slotDate: string;
  slotStartTime: string;
  status: AppointmentSlotStatus;
  selectedByUserId: string | null;
  occurredAt: string;
}

export interface AppointmentUpdatedRealtimeEvent {
  eventId: string;
  appointmentId: string;
  slotId: string;
  userId: string;
  status: AppointmentStatus;
  occurredAt: string;
}
