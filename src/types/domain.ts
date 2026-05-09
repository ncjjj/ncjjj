export type ServiceRequestStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "received";
export type AppointmentSlotStatus = "available" | "selected" | "confirmed";
export type AppointmentStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ServiceRequestDocument {
  id: string;
  type: string;
  filePath: string;
  signedUrl?: string | null;
}

export interface ServiceRequestView {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceId: string;
  serviceName?: string;
  pan: string | null;
  aadhaar: string | null;
  gstNumber: string | null;
  status: ServiceRequestStatus;
  createdAt: Date;
  adminRemarks: string | null;
  paymentStatus: PaymentStatus;
  paymentAmount: string;
  paymentNote: string;
  documents: ServiceRequestDocument[];
}

export interface ServiceRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ServiceUpdatedRealtimeEvent {
  eventId: string;
  requestId: string;
  userId: string;
  status: ServiceRequestStatus;
  adminRemarks: string | null;
  paymentStatus: PaymentStatus;
  paymentNote: string | null;
  occurredAt: string;
}

export interface AdminNoteAddedRealtimeEvent {
  eventId: string;
  requestId: string;
  userId: string;
  adminRemarks: string | null;
  occurredAt: string;
}

export interface ServicePreviewRealtimeEvent {
  eventId: string;
  requestId: string;
  userId: string;
  status: ServiceRequestStatus;
  adminRemarks: string | null;
  paymentStatus: PaymentStatus;
  paymentNote: string | null;
  occurredAt: string;
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
  adminAction: string | null;
  adminRemarks: string | null;
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
  adminAction: string | null;
  adminRemarks: string | null;
  occurredAt: string;
}

export interface AdminDocumentView {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  documentType: string;
  documentCategory: "general" | "yearly" | "permanent";
  documentYear: number | null;
  documentSlot: string | null;
  fileName: string;
  filePath: string;
  signedUrl: string | null;
  mimeType: string | null;
  createdAt: string;
}

export interface AdminDocumentUserGroup {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  documents: AdminDocumentView[];
}
