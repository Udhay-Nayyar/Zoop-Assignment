CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service_area VARCHAR(120) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agents_phone_key UNIQUE (phone)
);

CREATE UNIQUE INDEX IF NOT EXISTS agents_email_lower_key
  ON agents (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_agents_status
  ON agents (status);

CREATE INDEX IF NOT EXISTS idx_agents_service_area
  ON agents (service_area);

CREATE INDEX IF NOT EXISTS idx_agents_created_at
  ON agents (created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agents_set_updated_at ON agents;

CREATE TRIGGER agents_set_updated_at
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
