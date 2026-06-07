import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "../index";
import { profiles, users } from "../schema";
import { findProfileByEmail } from "./profiles";

type DbUser = InferSelectModel<typeof users>;
type UserPublic = Pick<
  DbUser,
  "id" | "name" | "firmName" | "mobileNumber" | "email" | "address" | "avatarPath" | "avatarUrl" | "serviceAccess"
>;

interface CreateUserInput {
  name: string;
  mobileNumber?: string;
  email: string;
  address?: string;
  password: string;
  firmName?: string;
  panCard?: string;
  aadhaarCard?: string;
  dob?: string;
  gender?: string;
  citizen?: string;
  residentialStatus?: string;
  aadhaarOtpVerified?: boolean;
  serviceAccess?: string;
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

export async function findUserByMobileNumber(mobileNumber: string): Promise<DbUser | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.mobileNumber, mobileNumber)).limit(1);
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
  firmName = "",
  panCard = "",
  aadhaarCard = "",
  dob = "",
  gender = "",
  citizen = "",
  residentialStatus = "",
  aadhaarOtpVerified = false,
  serviceAccess = "",
}: CreateUserInput) {
  const db = getDb();
  const hashedPassword = await bcrypt.hash(password, 10);
  const normalizedEmail = email.trim().toLowerCase();
  const existingProfile = await findProfileByEmail(normalizedEmail);
  const profileAddress = address.trim() || existingProfile?.address || "";
  const profilePhone = mobileNumber.trim() || existingProfile?.phone || "";
  const profileFirmName = existingProfile?.firmName || null;

  const created = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        name,
        firmName: firmName.trim() || null,
        mobileNumber: profilePhone,
        email: normalizedEmail,
        address: profileAddress,
        panCard: panCard.trim() || null,
        aadhaarCard: aadhaarCard.trim() || null,
        dob: dob.trim() || null,
        gender: gender.trim() || null,
        citizen: citizen.trim() || null,
        residentialStatus: residentialStatus.trim() || null,
        aadhaarOtpVerified,
        serviceAccess: serviceAccess.trim(),
        password: hashedPassword,
        passwordPlain: password,
      })
      .returning({
        id: users.id,
        name: users.name,
        firmName: users.firmName,
        mobileNumber: users.mobileNumber,
        email: users.email,
        address: users.address,
        serviceAccess: users.serviceAccess,
        avatarPath: users.avatarPath,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      });

    if (!user) {
      throw new Error("Failed to create user.");
    }

    if (existingProfile) {
      await tx
        .update(profiles)
        .set({
          fullName: name.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
          phone: profilePhone,
          address: profileAddress,
          firmName: profileFirmName,
        })
        .where(eq(profiles.email, normalizedEmail));
    } else {
      await tx.insert(profiles).values({
        fullName: name.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        phone: profilePhone,
        address: profileAddress,
        firmName: firmName.trim() || null,
        avatarPath: null,
        avatarUrl: null,
      });
    }

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
      serviceAccess: users.serviceAccess,
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
      serviceAccess: users.serviceAccess,
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
      serviceAccess: users.serviceAccess,
      avatarPath: users.avatarPath,
      avatarUrl: users.avatarUrl,
    });

  return updated ?? null;
}

export async function updateUserServiceAccessByEmail(
  email: string,
  serviceAccess: string
): Promise<UserPublic | null> {
  const db = getDb();

  const [updated] = await db
    .update(users)
    .set({ serviceAccess })
    .where(eq(users.email, email.trim().toLowerCase()))
    .returning({
      id: users.id,
      name: users.name,
      firmName: users.firmName,
      mobileNumber: users.mobileNumber,
      email: users.email,
      address: users.address,
      serviceAccess: users.serviceAccess,
      avatarPath: users.avatarPath,
      avatarUrl: users.avatarUrl,
    });

  return updated ?? null;
}
