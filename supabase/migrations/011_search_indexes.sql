-- Enable trigram extension (required for GIN text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for ILIKE search on key columns
CREATE INDEX IF NOT EXISTS idx_fragrances_name_trgm
  ON fragrances USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_fragrances_brand_trgm
  ON fragrances USING GIN (brand gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_fragrances_plain_description_trgm
  ON fragrances USING GIN (plain_description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_fragrances_inspired_by_trgm
  ON fragrances USING GIN (inspired_by gin_trgm_ops);
