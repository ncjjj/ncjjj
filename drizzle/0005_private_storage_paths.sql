ALTER TABLE users RENAME COLUMN avatar_url TO avatar_path;

ALTER TABLE service_documents ADD COLUMN IF NOT EXISTS file_path text;

UPDATE users
SET avatar_path = split_part(
  regexp_replace(
    avatar_path,
    '^.*?/storage/v1/object/(?:public|sign|authenticated)/profile-assets/',
    ''
  ),
  '?',
  1
)
WHERE avatar_path IS NOT NULL
  AND avatar_path <> ''
  AND (avatar_path LIKE 'http://%' OR avatar_path LIKE 'https://%');

UPDATE documents
SET file_url = split_part(
  regexp_replace(
    file_url,
    '^.*?/storage/v1/object/(?:public|sign|authenticated)/profile-assets/',
    ''
  ),
  '?',
  1
)
WHERE file_url IS NOT NULL
  AND file_url <> ''
  AND (file_url LIKE 'http://%' OR file_url LIKE 'https://%');

UPDATE documents
SET storage_path = file_url
WHERE (storage_path IS NULL OR storage_path = '')
  AND file_url IS NOT NULL
  AND file_url <> '';

UPDATE service_documents
SET file_path = split_part(
  regexp_replace(
    file_url,
    '^.*?/storage/v1/object/(?:public|sign|authenticated)/profile-assets/',
    ''
  ),
  '?',
  1
)
WHERE (file_path IS NULL OR file_path = '')
  AND file_url IS NOT NULL
  AND file_url <> '';

ALTER TABLE service_documents
ALTER COLUMN file_path SET NOT NULL;
