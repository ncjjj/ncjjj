import { date, integer, numeric, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const serviceRequestStatusEnum = pgEnum("service_request_status", [
  "pending",
  "approved",
  "rejected",
]);
export const adminActionEnum = pgEnum("admin_action", [
  "pending",
  "approved",
  "rejected",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "received"]);
export const appointmentSlotStatusEnum = pgEnum("appointment_slot_status", [
  "available",
  "selected",
  "confirmed",
]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);
export const consultantRegistrationStatusEnum = pgEnum("consultant_registration_status", [
  "pending",
  "approved",
  "rejected",
  "contacted",
  "closed",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  email: text("email").notNull().unique(),
  avatarPath: text("avatar_path"),
  avatarUrl: text("avatar_url"),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentYear: integer("document_year"),
  documentSlot: text("document_slot"),
  documentType: text("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  storagePath: text("storage_path").notNull().unique(),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  serviceId: text("service_id").notNull(),
  pan: text("pan"),
  aadhaar: text("aadhaar"),
  gstNumber: text("gst_number"),
  status: serviceRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const serviceDocuments = pgTable("service_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  fileUrl: text("file_url"),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminActions = pgTable("admin_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  action: adminActionEnum("action").notNull(),
  remarks: text("remarks"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminAccounts = pgTable("admin_accounts", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
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

export const appointmentSlots = pgTable("appointment_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  slotDate: date("slot_date").notNull(),
  slotStartTime: time("slot_start_time").notNull(),
  slotEndTime: time("slot_end_time").notNull(),
  status: appointmentSlotStatusEnum("status").notNull().default("available"),
  selectedByUserId: uuid("selected_by_user_id").references(() => users.id, { onDelete: "set null" }),
  selectedAt: timestamp("selected_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slotId: uuid("slot_id")
    .notNull()
    .references(() => appointmentSlots.id, { onDelete: "cascade" }),
  slotDate: date("slot_date").notNull(),
  slotStartTime: time("slot_start_time").notNull(),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  adminAction: text("admin_action"),
  adminRemarks: text("admin_remarks"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

