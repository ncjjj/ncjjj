WITH ranked_bank_statements AS (
  SELECT
    id,
    user_id,
    EXTRACT(YEAR FROM created_at)::integer AS target_year,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, EXTRACT(YEAR FROM created_at)::integer
      ORDER BY created_at DESC
    ) AS row_number
  FROM documents
  WHERE document_type = 'bank_statement'
    AND document_year IS NULL
    AND document_slot IS NULL
),
convertible_bank_statements AS (
  SELECT candidate.id, candidate.target_year
  FROM ranked_bank_statements candidate
  WHERE candidate.row_number = 1
    AND NOT EXISTS (
      SELECT 1
      FROM documents existing
      WHERE existing.user_id = candidate.user_id
        AND existing.document_year = candidate.target_year
        AND existing.document_slot = 'bank_statement'
    )
)
UPDATE documents
SET document_year = convertible_bank_statements.target_year,
    document_slot = 'bank_statement'
FROM convertible_bank_statements
WHERE documents.id = convertible_bank_statements.id;

DROP INDEX IF EXISTS documents_user_permanent_type_unique;

CREATE UNIQUE INDEX IF NOT EXISTS documents_user_permanent_type_unique
ON documents (user_id, document_type)
WHERE document_year IS NULL
  AND document_slot IS NULL
  AND document_type IN ('aadhar', 'pan');
