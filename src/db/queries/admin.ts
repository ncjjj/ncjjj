import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../index";
import { adminAccounts, adminSessions } from "../schema";

export type AdminAccountRow = typeof adminAccounts.$inferSelect;

export type AdminSessionWithAdmin = {
  sessionId: string;
  adminId: string;
  username: string;
  email: string;
  expiresAt: Date;
};

export async function findAdminByIdentifier(identifier: string): Promise<AdminAccountRow | null> {
  const db = getDb();
  const normalized = identifier.trim().toLowerCase();

  const [admin] = await db
    .select()
    .from(adminAccounts)
    .where(eq(adminAccounts.username, normalized))
    .limit(1);

  if (admin) {
    return admin;
  }

  const [adminByEmail] = await db
    .select()
    .from(adminAccounts)
    .where(eq(adminAccounts.email, normalized))
    .limit(1);

  return adminByEmail ?? null;
}

export async function upsertAdminAccount(input: {
  username: string;
  email: string;
  passwordHash: string;
}): Promise<AdminAccountRow> {
  const db = getDb();
  const normalizedUsername = input.username.trim().toLowerCase();
  const normalizedEmail = input.email.trim().toLowerCase();

  const [existing] = await db
    .select()
    .from(adminAccounts)
    .where(eq(adminAccounts.email, normalizedEmail))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(adminAccounts)
      .set({
        username: normalizedUsername,
        passwordHash: input.passwordHash,
      })
      .where(eq(adminAccounts.id, existing.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update admin account.");
    }

    return updated;
  }

  const [created] = await db
    .insert(adminAccounts)
    .values({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: input.passwordHash,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create admin account.");
  }

  return created;
}

export async function createAdminSessionRecord(input: {
  adminId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  const db = getDb();

  await db.insert(adminSessions).values({
    adminId: input.adminId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
  });
}

export async function findActiveAdminSessionByTokenHash(
  tokenHash: string
): Promise<AdminSessionWithAdmin | null> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .select({
      sessionId: adminSessions.id,
      adminId: adminAccounts.id,
      username: adminAccounts.username,
      email: adminAccounts.email,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .innerJoin(adminAccounts, eq(adminAccounts.id, adminSessions.adminId))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, now)
      )
    )
    .orderBy(desc(adminSessions.createdAt))
    .limit(1);

  return row ?? null;
}

export async function revokeAdminSessionByTokenHash(tokenHash: string): Promise<void> {
  const db = getDb();

  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(eq(adminSessions.tokenHash, tokenHash));
}