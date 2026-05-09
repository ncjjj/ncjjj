import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { getDb } from "../index";
import { users } from "../schema";

type DbUser = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;
type UserPublic = Pick<
  DbUser,
  "id" | "name" | "mobileNumber" | "email" | "avatarPath" | "avatarUrl" | "role"
>;

interface CreateUserInput {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  role?: NewUser["role"];
}

interface UpdateUserProfileInput {
  name: string;
  email: string;
  mobileNumber: string;
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
  mobileNumber,
  email,
  password,
  role = "user",
}: CreateUserInput) {
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
      avatarUrl: users.avatarUrl,
      role: users.role,
      createdAt: users.createdAt,
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
      mobileNumber: users.mobileNumber,
      email: users.email,
      avatarPath: users.avatarPath,
      avatarUrl: users.avatarUrl,
      role: users.role,
    });

  return updated ?? null;
}

export async function updateUserProfile(
  userId: string,
  { name, email, mobileNumber }: UpdateUserProfileInput
): Promise<UserPublic | null> {
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
      avatarUrl: users.avatarUrl,
      role: users.role,
    });

  return updated ?? null;
}

export async function listRegisteredUsersForAdmin() {
  const db = getDb();

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobileNumber: users.mobileNumber,
      createdAt: users.createdAt,
      role: users.role,
    })
    .from(users);
}
