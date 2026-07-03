-- DB-001: Widen collections.status enum to support shelf eligibility
-- Add 'tested' and 'past_purchase' to allow tracking fragrance interaction history

ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_status_check;

ALTER TABLE collections ADD CONSTRAINT collections_status_check
  CHECK (status IN ('owned','tested','past_purchase','wishlist'));

-- No data migration needed — existing rows ('owned', 'wishlist') remain valid
