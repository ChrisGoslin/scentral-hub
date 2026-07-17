-- full_name and inspired_by exist live on public.fragrances (both nullable
-- text, verified read-only via Supabase MCP, 2026-07-17) but were never
-- captured in any migration — same gap as handle_new_user/profiles found
-- earlier. Backfilling here, positioned right after initial_schema, means
-- later migrations that reference these columns (e.g. search index creation)
-- no longer need their own existence guards for them.

DO $$
BEGIN
  IF to_regclass('public.fragrances') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS full_name text;
  ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS inspired_by text;
END
$$;
