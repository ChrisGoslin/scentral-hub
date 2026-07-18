-- top_notes/heart_notes/base_notes exist live on public.fragrances (verified
-- read-only via Supabase MCP, 2026-07-18: all three text[], nullable, no
-- default) but were never captured in any migration — referenced directly
-- in INSERT statements starting from 20260604_reference_catalogue.sql with
-- no CREATE/ALTER anywhere in the repo. Same gap as handle_new_user and
-- full_name/inspired_by found earlier — a column created directly in the
-- Supabase SQL editor at some point, backfilled here so a fresh replay has
-- it before any migration tries to insert into it.

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
