import { bigserial, boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const consultantRegistrationStatusEnum = pgEnum("consultant_registration_status", [
  "pending",
  "approved",
  "rejected",
  "contacted",
  "closed",
]);

export const ngoServiceEnquiryStatusEnum = pgEnum("ngo_service_enquiry_status", [
  "pending",
  "contacted",
  "closed",
]);

export const consultationRequestStatusEnum = pgEnum("consultation_request_status", [
  "pending",
  "seen",
  "contacted",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  firmName: text("firm_name"),
  avatarPath: text("avatar_path"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const consultationRequests = pgTable("consultation_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  serviceName: text("service_name").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  firmName: text("firm_name"),
  address: text("address").notNull(),
  note: text("note"),
  status: consultationRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminAccounts = pgTable("admin_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminAccounts.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const appMigrations = pgTable("_app_migrations", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull().unique(),
  appliedAt: timestamp("applied_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  firmName: text("firm_name"),
  mobileNumber: text("mobile_number").notNull(),
  email: text("email").notNull().unique(),
  address: text("address").notNull(),
  panCard: text("pan_card"),
  aadhaarCard: text("aadhaar_card"),
  dob: text("dob"),
  gender: text("gender"),
  citizen: text("citizen"),
  residentialStatus: text("residential_status"),
  aadhaarOtpVerified: boolean("aadhaar_otp_verified").notNull().default(false),
  serviceAccess: text("service_access").notNull().default(""),
  avatarPath: text("avatar_path"),
  avatarUrl: text("avatar_url"),
  password: text("password").notNull(),
  passwordPlain: text("password_plain"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
  documentYear: integer("document_year"),
  documentSlot: text("document_slot"),
  documentType: text("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  storagePath: text("storage_path").notNull().unique(),
  mimeType: text("mime_type"),
  uploadStatus: text("upload_status").notNull().default("uploaded"),
  aadharNumber: text("aadhar_number"),
  panNumber: text("pan_number"),
  accountNumber: text("account_number"),
  gstNumber: text("gst_number"),
  uploadDescription: text("upload_description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const consultantRegistrations = pgTable("consultant_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  consultantName: text("consultant_name"),
  preferredAt: timestamp("preferred_at", { withTimezone: true }),
  notes: text("notes"),
  status: consultantRegistrationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ngoServiceEnquiries = pgTable("ngo_service_enquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  serviceKey: text("service_key").notNull(),
  serviceName: text("service_name").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  firmName: text("firm_name"),
  address: text("address").notNull(),
  note: text("note"),
  status: ngoServiceEnquiryStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

