import { eq } from "drizzle-orm";
import { getDb } from "../index";
import { users } from "../schema";

export async function findUserByEmail(email) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function findUserById(userId) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

export async function createUser({ name, mobileNumber, email, password, role = "user" }) {
  const db = getDb();

  const [created] = await db
    .insert(users)
    .values({ name, mobileNumber, email, password, role })
    .returning({
      id: users.id,
      name: users.name,
      mobileNumber: users.mobileNumber,
      email: users.email,
      avatarPath: users.avatarPath,
      role: users.role,
      createdAt: users.createdAt,
    });

  return created;
}

export async function updateUserAvatarPath(userId, avatarPath) {
  const db = getDb();

  const [updated] = await db
    .update(users)
    .set({ avatarPath })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      mobileNumber: users.mobileNumber,
      email: users.email,
      avatarPath: users.avatarPath,
      role: users.role,
    });

  return updated ?? null;
}

export async function updateUserProfile(userId, { name, email, mobileNumber }) {
  const db = getDb();

  const [updated] = await db
    .update(users)
    .set({
      name,
      email,
      mobileNumber,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      mobileNumber: users.mobileNumber,
      email: users.email,
      avatarPath: users.avatarPath,
      role: users.role,
    });

  return updated ?? null;
}
