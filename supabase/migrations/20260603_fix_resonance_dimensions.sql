-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add typed embedding column (3072 dims = gemini-embedding-001)
ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS embedding vector(3072);

-- Migrate text arrays stored in primary_vector → typed vector column
UPDATE fragrances
SET embedding = primary_vector::vector(3072)
WHERE primary_vector IS NOT NULL
  AND primary_vector LIKE '[%';

-- Restore primary_vector to human-readable family label
UPDATE fragrances
SET primary_vector = family
WHERE family IS NOT NULL;

-- HNSW index via halfvec cast — required because pgvector HNSW caps at 2000 dims,
-- but halfvec supports up to 4000 dims (pgvector 0.7+)
CREATE INDEX IF NOT EXISTS fragrances_embedding_hnsw_idx
ON fragrances USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- resonance_match RPC: returns most similar fragrances for a given embedding
CREATE OR REPLACE FUNCTION resonance_match(
  query_embedding vector(3072),
  match_count     int     DEFAULT 5,
  match_threshold float   DEFAULT 0.70
)
RETURNS TABLE (
  id         uuid,
  brand      text,
  name       text,
  family     text,
  image_url  text,
  similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    f.id,
    f.brand,
    f.name,
    f.family,
    f.image_url,
    (1 - (f.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)))::float AS similarity
  FROM fragrances f
  WHERE f.embedding IS NOT NULL
    AND (1 - (f.embedding::halfvec(3072) <=> query_embedding::halfvec(3072))) > match_threshold
  ORDER BY f.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  LIMIT match_count;
$$;
