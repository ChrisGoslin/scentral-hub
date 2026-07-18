-- Redundant re-backfill of top_notes/heart_notes/base_notes on
-- public.fragrances. Positioned right after 20260507000003 so it still runs
-- well before 20260604_reference_catalogue.sql, which is the migration that
-- actually needs these columns to exist.
--
-- 20260507000003_backfill_note_columns.sql already adds these columns, and
-- is confirmed correct (running its body directly against a live preview
-- branch succeeds with no errors, 2026-07-18). Despite that, a from-scratch
-- Supabase Preview branch replay still comes up without these columns even
-- though that version is listed as applied. Most likely cause: branch
-- creation seeds from a migration-history snapshot that already recorded
-- 20260507000003 as applied from before it was fixed, so the replay skips
-- re-running its now-correct body under that version number. Same pattern
-- fixed on PR64's copy (20260507000005_backfill_fragrance_columns_v2.sql).
--
-- Renaming 20260507000003 to a fresh version would dodge this, but risks
-- re-executing it non-idempotently against any environment that already has
-- it recorded under its current version — flagged and deliberately
-- deferred earlier this session. Adding a new, never-before-seen version
-- number here is the safe alternative: it cannot collide with any prior
-- "applied" record, and every statement is idempotent (IF NOT EXISTS), so
-- this is a safe no-op on any environment where the columns already exist.

DO $$
BEGIN
  IF to_regclass('public.fragrances') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS top_notes text[];
  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS heart_notes text[];
  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS base_notes text[];
END
$$;
