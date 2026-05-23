import { desc, eq } from "drizzle-orm";
import { getDb } from "../index";
import { consultantRegistrations, users } from "../schema";

export type ConsultantRegistrationStatus = "pending" | "approved" | "rejected" | "contacted" | "closed";

export type ConsultantRegistrationView = {
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
};

type CreateConsultantRegistrationInput = {
  userId: string;
  consultantName?: string | null;
  preferredAt?: Date | null;
  notes?: string | null;
};

export async function createConsultantRegistration({
  userId,
  consultantName = null,
  preferredAt = null,
  notes = null,
}: CreateConsultantRegistrationInput) {
  const db = getDb();

  const [created] = await db
    .insert(consultantRegistrations)
    .values({
      userId,
      consultantName,
      preferredAt,
      notes,
      status: "pending",
    })
    .returning({
      id: consultantRegistrations.id,
      userId: consultantRegistrations.userId,
      consultantName: consultantRegistrations.consultantName,
      preferredAt: consultantRegistrations.preferredAt,
      notes: consultantRegistrations.notes,
      status: consultantRegistrations.status,
      createdAt: consultantRegistrations.createdAt,
    });

  return created ?? null;
}

export async function listConsultantRegistrationsForUser(
  userId: string
): Promise<ConsultantRegistrationView[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: consultantRegistrations.id,
      userId: consultantRegistrations.userId,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.mobileNumber,
      consultantName: consultantRegistrations.consultantName,
      preferredAt: consultantRegistrations.preferredAt,
      notes: consultantRegistrations.notes,
      status: consultantRegistrations.status,
      createdAt: consultantRegistrations.createdAt,
    })
    .from(consultantRegistrations)
    .innerJoin(users, eq(users.id, consultantRegistrations.userId))
    .where(eq(consultantRegistrations.userId, userId))
    .orderBy(desc(consultantRegistrations.createdAt));

  return rows;
}
