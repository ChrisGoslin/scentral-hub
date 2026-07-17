-- Fixes recurring prod statement timeouts (57014) on /api/search "smells like" queries.
-- search_by_note_similarity (20260622_note_similarity_search.sql) does a full sequential
-- scan of all 127,595 fragrances per call, normalizing each row's notes inline — even
-- though only ~282 rows actually have top_notes/heart_notes/base_notes populated. Called
-- once per exact-match seed in parallel (up to several per search), this intermittently
-- exceeded the statement timeout under load.
--
-- Fix: store each row's normalized note set in a real column, GIN-index it, and use the
-- `&&` (overlap) operator to pre-filter to candidates that share at least one note before
-- computing the exact similarity score. Any row with similarity_score > 0 must share at
-- least one note, so this is a lossless pre-filter, not an approximation.

ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS notes_normalized TEXT[];

CREATE OR REPLACE FUNCTION fragrances_set_notes_normalized()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.notes_normalized := ARRAY(
    SELECT DISTINCT lower(n)
    FROM unnest(COALESCE(NEW.top_notes, '{}') || COALESCE(NEW.heart_notes, '{}') || COALESCE(NEW.base_notes, '{}')) AS n
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fragrances_notes_normalized ON fragrances;
CREATE TRIGGER trg_fragrances_notes_normalized
  BEFORE INSERT OR UPDATE OF top_notes, heart_notes, base_notes ON fragrances
  FOR EACH ROW
  EXECUTE FUNCTION fragrances_set_notes_normalized();

-- Backfill existing rows
UPDATE fragrances
SET notes_normalized = ARRAY(
  SELECT DISTINCT lower(n)
  FROM unnest(COALESCE(top_notes, '{}') || COALESCE(heart_notes, '{}') || COALESCE(base_notes, '{}')) AS n
)
WHERE notes_normalized IS NULL;

CREATE INDEX IF NOT EXISTS idx_fragrances_notes_normalized_gin
  ON fragrances USING GIN (notes_normalized);

DROP FUNCTION IF EXISTS search_by_note_similarity(TEXT[], UUID, FLOAT, INT);

CREATE OR REPLACE FUNCTION search_by_note_similarity(
  seed_notes TEXT[],
  exclude_id UUID DEFAULT NULL,
  min_similarity FLOAT DEFAULT 0.7,
  limit_results INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  similarity_score FLOAT
)
LANGUAGE sql
STABLE
AS $$
  WITH seed AS (
    SELECT ARRAY(SELECT DISTINCT lower(n) FROM unnest(seed_notes) AS n) AS notes
  ),
  candidates AS (
    SELECT f.id, f.notes_normalized
    FROM fragrances f, seed
    WHERE f.notes_normalized && seed.notes
      AND (exclude_id IS NULL OR f.id != exclude_id)
  ),
  scored AS (
    SELECT
      c.id,
      (
        SELECT COUNT(*) FROM unnest(c.notes_normalized) fn WHERE fn = ANY(seed.notes)
      )::float / GREATEST(array_length(seed.notes, 1), array_length(c.notes_normalized, 1), 1) AS similarity_score
    FROM candidates c, seed
  )
  SELECT id, similarity_score
  FROM scored
  WHERE similarity_score >= min_similarity
  ORDER BY similarity_score DESC
  LIMIT limit_results;
$$;
