-- DB-002: Add blind_buy flag to shelf_items for tracking blind-ranking provenance
-- Allows Insights to distinguish between researched and blind-buy selections
--
-- This file was re-versioned — production already has DB-002 applied and
-- shelf_items.blind_buy present under its original version, which won't be
-- in a fresh/re-versioned migration history. IF NOT EXISTS makes it a
-- no-op there instead of aborting on "column already exists" and blocking
-- DB-003 and every migration after it.

ALTER TABLE shelf_items ADD COLUMN IF NOT EXISTS blind_buy boolean NOT NULL DEFAULT false;

-- Backfill: fragrances sourced from blind_ranking will be marked true via trigger
-- (see DB-007 migration for the trigger that marks blind_buys on reveal)
