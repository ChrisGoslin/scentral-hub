-- DB-003: Tier model + eligibility enforcement for shelf_items
-- Adds S/A/B/C tiers (GENERATED from rank), rank range constraint, and DB-enforced eligibility

-- Step 1: Permit rank 0 (intermediate state during reorder) + full -20..20 range for two-phase updates
ALTER TABLE shelf_items ADD CONSTRAINT shelf_items_rank_range
  CHECK (rank BETWEEN -20 AND 20 AND rank <> 0);

-- Step 2: Add tier as GENERATED ALWAYS column (read-only, derived from rank)
ALTER TABLE shelf_items ADD COLUMN tier text GENERATED ALWAYS AS (
  CASE WHEN rank BETWEEN 1 AND 5 THEN 'S'
       WHEN rank BETWEEN 6 AND 10 THEN 'A'
       WHEN rank BETWEEN 11 AND 15 THEN 'B'
       WHEN rank BETWEEN 16 AND 20 THEN 'C'
       ELSE NULL
  END
) STORED;

-- Step 3: Add tier index for queries like "get user's S-tier fragrances"
CREATE INDEX idx_shelf_items_user_tier ON shelf_items(user_id, tier)
  WHERE rank BETWEEN 1 AND 20;

-- Step 4: Eligibility trigger — only Tested/Owned/Past-Purchase fragrances can be shelved
-- This enforces DB-level that the app cannot bypass
CREATE OR REPLACE FUNCTION enforce_shelf_eligibility() RETURNS trigger AS $$
BEGIN
  -- Allow NULL fragrance_id (empty slot) or check eligibility
  IF NEW.fragrance_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM collections c
      WHERE c.user_id = NEW.user_id
        AND c.fragrance_id = NEW.fragrance_id
        AND c.status IN ('owned','tested','past_purchase')
    ) THEN
      RAISE EXCEPTION 'fragrance not eligible for shelf (must be tested, owned, or past purchase)';
    END IF;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- Create trigger for INSERT and UPDATE of fragrance_id
DROP TRIGGER IF EXISTS shelf_eligibility ON shelf_items;
CREATE TRIGGER shelf_eligibility BEFORE INSERT OR UPDATE OF fragrance_id ON shelf_items
  FOR EACH ROW EXECUTE FUNCTION enforce_shelf_eligibility();

-- Backfill note: existing shelf_items rows seeded from noseprint matches may reference fragrances
-- NOT in collections. The trigger will block updates to those rows. Before enabling, backfill:
-- INSERT INTO collections (user_id, fragrance_id, status, created_at)
-- SELECT DISTINCT si.user_id, si.fragrance_id, 'tested', now()
-- FROM shelf_items si
-- WHERE si.fragrance_id IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM collections c
--     WHERE c.user_id = si.user_id AND c.fragrance_id = si.fragrance_id
--   )
-- ON CONFLICT (user_id, fragrance_id) DO NOTHING;
