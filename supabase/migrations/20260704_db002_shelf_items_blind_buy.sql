-- DB-002: Add blind_buy flag to shelf_items for tracking blind-ranking provenance
-- Allows Insights to distinguish between researched and blind-buy selections

ALTER TABLE shelf_items ADD COLUMN blind_buy boolean NOT NULL DEFAULT false;

-- Backfill: fragrances sourced from blind_ranking will be marked true via trigger
-- (see DB-007 migration for the trigger that marks blind_buys on reveal)
