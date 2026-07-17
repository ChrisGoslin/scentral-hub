-- Migration: 20260611_chemist_cache
-- Caches molecular analysis results for fragrance pairings

CREATE TABLE IF NOT EXISTS chemist_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fragrance_a_id uuid NOT NULL REFERENCES fragrances(id) ON DELETE CASCADE,
  fragrance_b_id uuid NOT NULL REFERENCES fragrances(id) ON DELETE CASCADE,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure order-independent lookup (A+B is same as B+A)
CREATE UNIQUE INDEX IF NOT EXISTS idx_chemist_pair 
ON chemist_cache (LEAST(fragrance_a_id, fragrance_b_id), GREATEST(fragrance_a_id, fragrance_b_id));
