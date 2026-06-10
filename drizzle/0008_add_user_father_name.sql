-- Add father name columns and migrate existing values from profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS father_name text;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS father_name text;

UPDATE public.users
SET father_name = profiles.father_name
FROM public.profiles
WHERE users.email = profiles.email
  AND users.father_name IS NULL
  AND profiles.father_name IS NOT NULL;
