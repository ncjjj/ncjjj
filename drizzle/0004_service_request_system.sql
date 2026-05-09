DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_request_status') THEN
    CREATE TYPE service_request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_action') THEN
    CREATE TYPE admin_action AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'received');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id text NOT NULL,
  pan text,
  aadhaar text,
  gst_number text,
  status service_request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  type text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  action admin_action NOT NULL,
  remarks text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'pending',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
