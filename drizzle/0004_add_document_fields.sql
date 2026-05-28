-- Migration: add optional document metadata columns
-- Adds columns used by upload forms to the documents table if they don't exist

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS document_year integer;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS document_slot text;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS aadhar_number text;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS pan_number text;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS account_number text;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS gst_number text;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS upload_description text;
