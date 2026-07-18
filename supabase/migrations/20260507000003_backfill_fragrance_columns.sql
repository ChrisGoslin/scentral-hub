-- full_name/inspired_by and top_notes/heart_notes/base_notes exist live on
-- public.fragrances (all nullable, text/text[], verified read-only via
-- Supabase MCP, 2026-07-17/18) but were never captured in any migration —
-- same gap as handle_new_user/profiles found earlier. Backfilling here,
-- positioned right after initial_schema, means later migrations that
-- reference these columns (e.g. search index creation, reference_catalogue
-- inserts) no longer need their own existence guards for them.

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
