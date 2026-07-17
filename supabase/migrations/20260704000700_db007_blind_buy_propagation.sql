-- DB-007: Wire blind_buy provenance from blind_ranking to shelf_items on reveal
-- When a blind ranking is revealed and fragrances are placed into shelf, mark source='blind_ranking' items with blind_buy=true

-- This trigger fires on INSERT to shelf_items and marks blind_buy=true for fragrances that:
--   1. Source from blind_ranking
--   2. Are NOT already in collections (first time being shelved)

CREATE OR REPLACE FUNCTION set_blind_buy_on_reveal() RETURNS trigger AS $$
BEGIN
  -- If source is 'blind_ranking' and fragrance is not in collections, mark as blind buy
  IF NEW.source = 'blind_ranking' THEN
    IF NOT EXISTS (
      SELECT 1 FROM collections c
      WHERE c.user_id = NEW.user_id AND c.fragrance_id = NEW.fragrance_id
    ) THEN
      NEW.blind_buy := true;
    END IF;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blind_buy_on_reveal ON shelf_items;
CREATE TRIGGER set_blind_buy_on_reveal BEFORE INSERT ON shelf_items
  FOR EACH ROW EXECUTE FUNCTION set_blind_buy_on_reveal();
