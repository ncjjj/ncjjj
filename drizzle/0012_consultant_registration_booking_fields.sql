ALTER TABLE consultant_registrations
ADD COLUMN IF NOT EXISTS consultant_name text;

ALTER TABLE consultant_registrations
ADD COLUMN IF NOT EXISTS preferred_at timestamp with time zone;

ALTER TABLE consultant_registrations
ADD COLUMN IF NOT EXISTS notes text;
