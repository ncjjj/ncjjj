-- Idempotent schema reconcile: ensure all columns referenced by the app exist.
-- Safe to run on databases that already applied earlier migrations.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS father_name text;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pan_card text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aadhaar_card text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS citizen text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS residential_status text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aadhaar_otp_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS service_access text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_plain text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS father_name text;

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_year integer;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_slot text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS aadhar_number text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS pan_number text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS gst_number text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS upload_description text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS uploaded_by_user_id uuid;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS upload_status text NOT NULL DEFAULT 'uploaded';

UPDATE public.users
SET father_name = profiles.father_name
FROM public.profiles
WHERE users.email = profiles.email
  AND users.father_name IS NULL
  AND profiles.father_name IS NOT NULL;
