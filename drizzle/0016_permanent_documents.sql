ALTER TABLE documents ADD COLUMN IF NOT EXISTS aadhar_number text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS pan_number text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS gst_number text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS upload_description text;

CREATE UNIQUE INDEX IF NOT EXISTS documents_user_permanent_type_unique
ON documents (user_id, document_type)
WHERE document_year IS NULL
  AND document_slot IS NULL
  AND document_type IN (
    'aadhar',
    'pan'
  );
