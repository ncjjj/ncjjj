ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "document_year" integer;
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "document_slot" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "documents_user_year_slot_unique" ON "documents" USING btree ("user_id","document_year","document_slot") WHERE ("document_year" IS NOT NULL AND "document_slot" IS NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_user_year_idx" ON "documents" USING btree ("user_id","document_year") WHERE ("document_year" IS NOT NULL);