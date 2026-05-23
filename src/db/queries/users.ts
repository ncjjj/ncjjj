import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "../index";
import { profiles, users } from "../schema";

type DbUser = InferSelectModel<typeof users>;
type UserPublic = Pick<
  DbUser,
  "id" | "name" | "firmName" | "mobileNumber" | "email" | "address" | "avatarPath" | "avatarUrl"
>;

interface CreateUserInput {
  name: string;
  mobileNumber?: string;
  email: string;
  address?: string;
  password: string;
}

interface UpdateUserProfileInput {
  name: string;
  email: string;
  mobileNumber: string;
  firmName?: string | null;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function findUserById(userId: string): Promise<DbUser | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

export async function createUser({
  name,
  mobileNumber = "",
  email,
  address = "",
  password,
}: CreateUserInput) {
  const db = getDb();
  const hashedPassword = await bcrypt.hash(password, 10);

  const created = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ name, mobileNumber, email, address, password: hashedPassword })
      .returning({
        id: users.id,
        name: users.name,
        firmName: users.firmName,
        mobileNumber: users.mobileNumber,
        email: users.email,
        address: users.address,
        avatarPath: users.avatarPath,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      });

    if (!user) {
      throw new Error("Failed to create user.");
    }

    await tx.insert(profiles).values({
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashedPassword,
      phone: (mobileNumber || "").trim(),
      address: (address || "").trim(),
      firmName: null,
      avatarPath: null,
      avatarUrl: null,
    });

    return user;
  });

  return created;
}

export async function updateUserAvatarPath(
  userId: string,
  avatarPath: string | null,
  avatarUrl: string | null
): Promise<UserPublic | null> {
  const db = getDb();

  const [updated] = await db
    .update(users)
    .set({ avatarPath, avatarUrl })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      firmName: users.firmName,
      mobileNumber: users.mobileNumber,
      email: users.email,
      address: users.address,
      avatarPath: users.avatarPath,
      avatarUrl: users.avatarUrl,
    });

  return updated ?? null;
}

export async function updateUserPasswordByEmail(
  email: string,
  passwordHash: string
): Promise<UserPublic | null> {
  const db = getDb();

  const [updatedUser] = await db
    .update(users)
    .set({ password: passwordHash })
    .where(eq(users.email, email))
    .returning({
      id: users.id,
      name: users.name,
      firmName: users.firmName,
      mobileNumber: users.mobileNumber,
      email: users.email,
      address: users.address,
      avatarPath: users.avatarPath,
      avatarUrl: users.avatarUrl,
    });

  await db
    .update(profiles)
    .set({ passwordHash })
    .where(eq(profiles.email, email));

  return updatedUser ?? null;
}

export async function updateUserProfile(
  userId: string,
  { name, email, mobileNumber, firmName }: UpdateUserProfileInput
): Promise<UserPublic | null> {
  const db = getDb();

  const [updated] = await db
    .update(users)
    .set({
      name,
      email,
      mobileNumber,
      ...(firmName !== undefined && { firmName }),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      firmName: users.firmName,
      mobileNumber: users.mobileNumber,
      email: users.email,
      address: users.address,
      avatarPath: users.avatarPath,
      avatarUrl: users.avatarUrl,
    });

  return updated ?? null;
}
