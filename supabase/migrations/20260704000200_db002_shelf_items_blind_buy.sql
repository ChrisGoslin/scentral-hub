-- DB-002: Add blind_buy flag to shelf_items for tracking blind-ranking provenance
-- Allows Insights to distinguish between researched and blind-buy selections
--
-- This file was re-versioned (see docs/HANDOVER.md:56-88) — production
-- already has DB-002 applied and shelf_items.blind_buy present under its
-- original version, which won't be in remote history at this new version.
-- IF NOT EXISTS makes it a no-op there instead of aborting on "column
-- already exists" and blocking the 20260711* migrations after it.

ALTER TABLE shelf_items ADD COLUMN IF NOT EXISTS blind_buy boolean NOT NULL DEFAULT false;

-- Backfill: fragrances sourced from blind_ranking will be marked true via trigger
-- (see DB-007 migration for the trigger that marks blind_buys on reveal)
