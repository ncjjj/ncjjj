import { desc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { getDb } from "../index";
import { profiles } from "../schema";

type ProfileRow = InferSelectModel<typeof profiles>;

export type ProfilePublic = Pick<
  ProfileRow,
  "id" | "fullName" | "firmName" | "phone" | "address" | "email" | "avatarPath" | "avatarUrl"
>;

export interface CreateProfileInput {
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
  firmName?: string | null;
  avatarPath?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileInput {
  fullName: string;
  email: string;
  phone: string;
  firmName?: string | null;
}

export async function findProfileByEmail(email: string): Promise<ProfileRow | null> {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const [profile] = await db.select().from(profiles).where(eq(profiles.email, normalizedEmail)).limit(1);
  return profile ?? null;
}

export async function findProfileByPhone(phone: string): Promise<ProfileRow | null> {
  const db = getDb();
  const [profile] = await db.select().from(profiles).where(eq(profiles.phone, phone)).limit(1);
  return profile ?? null;
}

export async function findProfileById(profileId: string): Promise<ProfileRow | null> {
  const db = getDb();
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
  return profile ?? null;
}

export async function createProfile(input: CreateProfileInput): Promise<ProfileRow> {
  const db = getDb();

  const [created] = await db
    .insert(profiles)
    .values({
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      phone: input.phone.trim(),
      address: input.address.trim(),
      firmName: input.firmName?.trim() || null,
      avatarPath: input.avatarPath || null,
      avatarUrl: input.avatarUrl || null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create profile.");
  }

  return created;
}

export async function listProfiles(): Promise<ProfileRow[]> {
  const db = getDb();

  return db.select().from(profiles).orderBy(desc(profiles.createdAt));
}

export async function updateProfileByEmail(
  email: string,
  input: UpdateProfileInput
): Promise<ProfilePublic | null> {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  const [updated] = await db
    .update(profiles)
    .set({
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      ...(input.firmName !== undefined && { firmName: input.firmName?.trim() || null }),
    })
    .where(eq(profiles.email, normalizedEmail))
    .returning({
      id: profiles.id,
      fullName: profiles.fullName,
      firmName: profiles.firmName,
      phone: profiles.phone,
      address: profiles.address,
      email: profiles.email,
      avatarPath: profiles.avatarPath,
      avatarUrl: profiles.avatarUrl,
    });

  return updated ?? null;
}

export async function updateProfileAvatarByEmail(
  email: string,
  avatarPath: string | null,
  avatarUrl: string | null
): Promise<ProfilePublic | null> {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  const [updated] = await db
    .update(profiles)
    .set({ avatarPath, avatarUrl })
    .where(eq(profiles.email, normalizedEmail))
    .returning({
      id: profiles.id,
      fullName: profiles.fullName,
      firmName: profiles.firmName,
      phone: profiles.phone,
      address: profiles.address,
      email: profiles.email,
      avatarPath: profiles.avatarPath,
      avatarUrl: profiles.avatarUrl,
    });

  return updated ?? null;
}
