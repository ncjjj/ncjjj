import { desc, eq } from "drizzle-orm";
import { getDb } from "../index";
import { ngoServiceEnquiries } from "../schema";

export interface CreateNgoServiceEnquiryInput {
  userId: string;
  serviceKey: string;
  serviceName: string;
  name: string;
  email: string;
  phone: string;
  firmName?: string | null;
  address: string;
  note?: string | null;
}

export async function createNgoServiceEnquiry(input: CreateNgoServiceEnquiryInput) {
  const db = getDb();

  const [created] = await db
    .insert(ngoServiceEnquiries)
    .values({
      userId: input.userId,
      serviceKey: input.serviceKey,
      serviceName: input.serviceName,
      name: input.name,
      email: input.email,
      phone: input.phone,
      firmName: input.firmName || null,
      address: input.address,
      note: input.note || null,
      status: "pending",
    })
    .returning({
      id: ngoServiceEnquiries.id,
      serviceName: ngoServiceEnquiries.serviceName,
      status: ngoServiceEnquiries.status,
      createdAt: ngoServiceEnquiries.createdAt,
    });

  if (!created) {
    throw new Error("Failed to save NGO service enquiry.");
  }

  return created;
}

export async function listNgoServiceEnquiriesForUser(userId: string) {
  const db = getDb();

  return db
    .select({
      id: ngoServiceEnquiries.id,
      serviceKey: ngoServiceEnquiries.serviceKey,
      serviceName: ngoServiceEnquiries.serviceName,
      address: ngoServiceEnquiries.address,
      note: ngoServiceEnquiries.note,
      status: ngoServiceEnquiries.status,
      createdAt: ngoServiceEnquiries.createdAt,
    })
    .from(ngoServiceEnquiries)
    .where(eq(ngoServiceEnquiries.userId, userId))
    .orderBy(desc(ngoServiceEnquiries.createdAt));
}
