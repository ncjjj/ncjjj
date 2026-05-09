UPDATE service_documents
SET file_url = file_path
WHERE file_url IS NULL
  AND file_path IS NOT NULL;

ALTER TABLE service_documents
ALTER COLUMN file_url DROP NOT NULL;
