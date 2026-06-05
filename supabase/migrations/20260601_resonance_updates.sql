-- Add missing columns for the Morocco Demo
ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS popularity_rank INT;
ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS photographic_description TEXT;
CREATE INDEX IF NOT EXISTS fragrances_popularity_rank_idx ON fragrances(popularity_rank);
