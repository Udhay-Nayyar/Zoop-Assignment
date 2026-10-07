CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram GIN indexes speed up ILIKE '%text%' searches, which normal btree indexes cannot do.
CREATE INDEX IF NOT EXISTS idx_agents_full_name_trgm
  ON agents USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_agents_email_trgm
  ON agents USING GIN (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_agents_service_area_trgm
  ON agents USING GIN (service_area gin_trgm_ops);
