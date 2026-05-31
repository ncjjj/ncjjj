-- Migration: add user details and service access columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_card text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_card text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS citizen text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS residential_status text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_otp_verified boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_access text NOT NULL DEFAULT '';
