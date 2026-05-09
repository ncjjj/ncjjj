CREATE TABLE IF NOT EXISTS admin_accounts (
  id text PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
