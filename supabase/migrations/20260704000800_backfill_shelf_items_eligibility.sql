-- Backfill collections entries for existing shelf_items
-- Required before DB-003 trigger is active (shelf_eligibility constraint)
-- This ensures all shelf_items reference fragrances that exist in collections

INSERT INTO collections (user_id, fragrance_id, status, created_at)
SELECT DISTINCT si.user_id, si.fragrance_id, 'tested', now()
FROM shelf_items si
WHERE si.fragrance_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM collections c
    WHERE c.user_id = si.user_id
      AND c.fragrance_id = si.fragrance_id
  )
ON CONFLICT (user_id, fragrance_id) DO NOTHING;

-- Verify: count of backfilled rows
-- SELECT COUNT(*) as backfilled_collections_count
-- FROM collections c
-- WHERE c.status = 'tested' AND c.created_at >= now() - interval '1 minute';
