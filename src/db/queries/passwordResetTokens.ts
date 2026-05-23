import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "../index";
import { passwordResetTokens } from "../schema";

export interface PasswordResetTokenRow {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export async function createPasswordResetToken(
  email: string,
  tokenHash: string,
  expiresAt: Date
): Promise<PasswordResetTokenRow> {
  const db = getDb();

  const [created] = await db
    .insert(passwordResetTokens)
    .values({
      email,
      tokenHash,
      expiresAt,
      used: false,
    })
    .returning({
      id: passwordResetTokens.id,
      email: passwordResetTokens.email,
      tokenHash: passwordResetTokens.tokenHash,
      expiresAt: passwordResetTokens.expiresAt,
      used: passwordResetTokens.used,
      createdAt: passwordResetTokens.createdAt,
    });

  if (!created) {
    throw new Error("Failed to create password reset token.");
  }

  return created;
}

export async function findLatestValidPasswordResetToken(
  email: string
): Promise<PasswordResetTokenRow | null> {
  const db = getDb();

  const [token] = await db
    .select({
      id: passwordResetTokens.id,
      email: passwordResetTokens.email,
      tokenHash: passwordResetTokens.tokenHash,
      expiresAt: passwordResetTokens.expiresAt,
      used: passwordResetTokens.used,
      createdAt: passwordResetTokens.createdAt,
    })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.email, email),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(1);

  return token ?? null;
}

export async function markPasswordResetTokenUsed(tokenId: string): Promise<void> {
  const db = getDb();

  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, tokenId));
}
