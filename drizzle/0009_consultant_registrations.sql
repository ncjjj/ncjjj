CREATE TYPE "public"."consultant_registration_status" AS ENUM('pending', 'contacted', 'closed');

CREATE TABLE "consultant_registrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "status" "consultant_registration_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "consultant_registrations"
ADD CONSTRAINT "consultant_registrations_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
ON DELETE cascade ON UPDATE no action;
