import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDb } from "../index";
import { adminAccounts } from "../schema";
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
} from "../../lib/adminAuth";

export async function ensureAdminAccountsTable() {
  const db = getDb();

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admin_accounts (
      id text PRIMARY KEY,
      username text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function findAdminByUsername(username: string) {
  await ensureAdminAccountsTable();
  const db = getDb();

  const [admin] = await db
    .select()
    .from(adminAccounts)
    .where(eq(adminAccounts.username, username))
    .limit(1);

  return admin ?? null;
}

export async function ensureDefaultAdminAccount() {
  await ensureAdminAccountsTable();
  const db = getDb();
  const existing = await findAdminByUsername(DEFAULT_ADMIN_USERNAME);

  if (!existing) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await db.insert(adminAccounts).values({
      id: randomUUID(),
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash,
    });

    return;
  }

  const isDefaultPasswordValid = await bcrypt.compare(
    DEFAULT_ADMIN_PASSWORD,
    existing.passwordHash
  );

  if (!isDefaultPasswordValid) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await db
      .update(adminAccounts)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(adminAccounts.username, DEFAULT_ADMIN_USERNAME));
  }
}

export async function validateAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  await ensureDefaultAdminAccount();
  const admin = await findAdminByUsername(username);

  if (!admin) {
    return false;
  }

  return bcrypt.compare(password, admin.passwordHash);
}
