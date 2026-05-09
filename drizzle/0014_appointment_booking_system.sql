CREATE TABLE IF NOT EXISTS "appointment_slots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slot_date" date NOT NULL,
  "slot_start_time" time NOT NULL,
  "slot_end_time" time NOT NULL,
  "status" text NOT NULL DEFAULT 'available',
  "selected_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "selected_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "slot_id" uuid NOT NULL REFERENCES "appointment_slots"("id") ON DELETE CASCADE,
  "slot_date" date NOT NULL,
  "slot_start_time" time NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "admin_action" text DEFAULT NULL,
  "admin_remarks" text DEFAULT NULL,
  "confirmed_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "appointments_user_slot_unique" ON "appointments" USING btree ("user_id", "slot_id") WHERE "status" != 'cancelled';

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_slots_date_status_idx" ON "appointment_slots" USING btree ("slot_date", "status");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_user_date_idx" ON "appointments" USING btree ("user_id", "slot_date");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments" USING btree ("status");
