-- Epic 3: "Smells Like" proximity search — note-composition similarity.
-- Scored as set-overlap (intersection / largest set) between a seed fragrance's notes
-- and every other fragrance's notes. NOTE: an earlier version of this function scored
-- via pg_trgm character-trigram similarity on concatenated note text — that measure is
-- dominated by string length/order and never reaches 0.7 even for near-identical note
-- sets (verified empirically against known clone pairs), so it's replaced here.
DROP FUNCTION IF EXISTS search_by_note_similarity(TEXT, UUID, FLOAT, INT);

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
  scored AS (
    SELECT
      f.id,
      (
        SELECT COUNT(*)
        FROM unnest(
          ARRAY(
            SELECT DISTINCT lower(n)
            FROM unnest(COALESCE(f.top_notes, '{}') || COALESCE(f.heart_notes, '{}') || COALESCE(f.base_notes, '{}')) AS n
          )
        ) fn
        WHERE fn = ANY(seed.notes)
      )::float / GREATEST(
        array_length(seed.notes, 1),
        array_length(
          ARRAY(
            SELECT DISTINCT lower(n)
            FROM unnest(COALESCE(f.top_notes, '{}') || COALESCE(f.heart_notes, '{}') || COALESCE(f.base_notes, '{}')) AS n
          ),
          1
        ),
        1
      ) AS similarity_score
    FROM fragrances f, seed
    WHERE exclude_id IS NULL OR f.id != exclude_id
  )
  SELECT id, similarity_score
  FROM scored
  WHERE similarity_score >= min_similarity
  ORDER BY similarity_score DESC
  LIMIT limit_results;
$$;
