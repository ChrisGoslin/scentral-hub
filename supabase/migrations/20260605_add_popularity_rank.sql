-- Add popularity_rank to fragrances table
ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS popularity_rank INT;
CREATE INDEX IF NOT EXISTS fragrances_popularity_rank_idx ON fragrances(popularity_rank);
