import { desc, eq } from "drizzle-orm";
import { getDb } from "../index";
import { consultationRequests } from "../schema";

export type ConsultationRequestStatus = "pending" | "seen" | "contacted";

export type ConsultationRequestView = {
  id: string;
  userId: string;
  serviceName: string;
  fullName: string;
  email: string;
  phone: string;
  firmName: string | null;
  address: string;
  note: string | null;
  status: ConsultationRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateConsultationRequestInput {
  userId: string;
  serviceName: string;
  fullName: string;
  email: string;
  phone: string;
  firmName?: string | null;
  address: string;
  note?: string | null;
}

export async function createConsultationRequest(
  input: CreateConsultationRequestInput
): Promise<ConsultationRequestView> {
  const db = getDb();

  const [created] = await db
    .insert(consultationRequests)
    .values({
      userId: input.userId,
      serviceName: input.serviceName.trim(),
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      firmName: input.firmName?.trim() || null,
      address: input.address.trim(),
      note: input.note?.trim() || null,
      status: "pending",
    })
    .returning({
      id: consultationRequests.id,
      userId: consultationRequests.userId,
      serviceName: consultationRequests.serviceName,
      fullName: consultationRequests.fullName,
      email: consultationRequests.email,
      phone: consultationRequests.phone,
      firmName: consultationRequests.firmName,
      address: consultationRequests.address,
      note: consultationRequests.note,
      status: consultationRequests.status,
      createdAt: consultationRequests.createdAt,
      updatedAt: consultationRequests.updatedAt,
    });

  if (!created) {
    throw new Error("Failed to save consultation request.");
  }

  return created;
}

export async function listConsultationRequests(): Promise<ConsultationRequestView[]> {
  const db = getDb();

  return db
    .select({
      id: consultationRequests.id,
      userId: consultationRequests.userId,
      serviceName: consultationRequests.serviceName,
      fullName: consultationRequests.fullName,
      email: consultationRequests.email,
      phone: consultationRequests.phone,
      firmName: consultationRequests.firmName,
      address: consultationRequests.address,
      note: consultationRequests.note,
      status: consultationRequests.status,
      createdAt: consultationRequests.createdAt,
      updatedAt: consultationRequests.updatedAt,
    })
    .from(consultationRequests)
    .orderBy(desc(consultationRequests.updatedAt), desc(consultationRequests.createdAt));
}

export async function listConsultationRequestsForEmail(
  email: string
): Promise<ConsultationRequestView[]> {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  return db
    .select({
      id: consultationRequests.id,
      userId: consultationRequests.userId,
      serviceName: consultationRequests.serviceName,
      fullName: consultationRequests.fullName,
      email: consultationRequests.email,
      phone: consultationRequests.phone,
      firmName: consultationRequests.firmName,
      address: consultationRequests.address,
      note: consultationRequests.note,
      status: consultationRequests.status,
      createdAt: consultationRequests.createdAt,
      updatedAt: consultationRequests.updatedAt,
    })
    .from(consultationRequests)
    .where(eq(consultationRequests.email, normalizedEmail))
    .orderBy(desc(consultationRequests.updatedAt), desc(consultationRequests.createdAt));
}

export async function updateConsultationRequestStatus(
  requestId: string,
  status: ConsultationRequestStatus
): Promise<ConsultationRequestView | null> {
  const db = getDb();

  const [updated] = await db
    .update(consultationRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(consultationRequests.id, requestId))
    .returning({
      id: consultationRequests.id,
      userId: consultationRequests.userId,
      serviceName: consultationRequests.serviceName,
      fullName: consultationRequests.fullName,
      email: consultationRequests.email,
      phone: consultationRequests.phone,
      firmName: consultationRequests.firmName,
      address: consultationRequests.address,
      note: consultationRequests.note,
      status: consultationRequests.status,
      createdAt: consultationRequests.createdAt,
      updatedAt: consultationRequests.updatedAt,
    });

  return updated ?? null;
}
