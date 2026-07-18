-- Redundant re-backfill of full_name/inspired_by/top_notes/heart_notes/
-- base_notes on public.fragrances. Positioned right after
-- 20260507000004_backfill_traces_table so it still runs well before
-- 20260604_reference_catalogue.sql, which is the migration that actually
-- needs these columns to exist.
--
-- 20260507000003_backfill_fragrance_columns.sql already adds these columns,
-- and is confirmed correct (running its body directly against a live
-- preview branch succeeds with no errors, 2026-07-18). Despite that, a
-- from-scratch Supabase Preview branch replay still comes up without these
-- columns even though 20260507000003 is listed as applied. The most likely
-- explanation: branch creation seeds from a migration-history snapshot that
-- already recorded that version as applied from an earlier, genuinely
-- broken run of the file (before it was fixed this session) — the replay
-- tracks versions, not content, so a fixed body under an already-recorded
-- version silently never re-runs.
--
-- Renaming 20260507000003 to a fresh version would dodge this, but risks
-- re-executing it non-idempotently against any environment (including
-- production) that already has it recorded under its current version —
-- flagged and deliberately deferred earlier this session. Adding a new,
-- never-before-seen version number here is the safe alternative: it cannot
-- collide with any prior "applied" record, and every statement is
-- idempotent (IF NOT EXISTS), so it's a no-op wherever the columns already
-- exist and a real fix wherever they don't.

DO $$
BEGIN
  IF to_regclass('public.fragrances') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS full_name text;
  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS inspired_by text;
  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS top_notes text[];
  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS heart_notes text[];
  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS base_notes text[];
END
$$;
