-- Migration: add missing document columns required by upload routes

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS uploaded_by_user_id uuid;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS upload_status text NOT NULL DEFAULT 'uploaded';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'documents_uploaded_by_user_id_fkey'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT documents_uploaded_by_user_id_fkey
      FOREIGN KEY (uploaded_by_user_id)
      REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END
$$;