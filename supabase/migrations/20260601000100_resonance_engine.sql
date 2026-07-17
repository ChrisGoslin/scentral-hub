-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to fragrances
ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create a resonance score function for semantic similarity
CREATE OR REPLACE FUNCTION resonance_match(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  brand text,
  name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fragrances.id,
    fragrances.brand,
    fragrances.name,
    1 - (fragrances.embedding <=> query_embedding) AS similarity
  FROM fragrances
  WHERE 1 - (fragrances.embedding <=> query_embedding) > match_threshold
  ORDER BY fragrances.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
