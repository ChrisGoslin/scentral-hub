-- 001_enable_rls_layering_combinations.sql
-- Historical migration kept for compatibility with older databases. Some
-- preview branches replay this file before the migration that creates
-- public.layering_combinations, so guard every operation on table existence.
--
-- Turns out no migration in this repo ever creates it at all — a
-- repo-wide search found none, despite this comment's claim. Backfilled
-- below (verified read-only against production via Supabase MCP,
-- 2026-07-18: user_id, not created_by_id, is the real owner column) so
-- app/api/layering/save/route.ts's writes don't fail at runtime on an
-- environment built from these migrations. The created_by_id-guarded
-- policy blocks further down are legacy and never fire against this
-- shape (harmless no-ops) — real production policies (lc_select_own/
-- lc_insert_own/lc_update_own/lc_delete_own, keyed on user_id) are added
-- alongside the table.

DO $$
BEGIN
  IF to_regclass('public.layering_combinations') IS NULL THEN
    CREATE TABLE public.layering_combinations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id),
      name text,
      base_collection_id uuid,
      top_collection_id uuid,
      third_collection_id uuid,
      fourth_collection_id uuid,
      base_sprays integer DEFAULT 1,
      top_sprays integer DEFAULT 2,
      third_sprays integer,
      fourth_sprays integer,
      layer_score numeric,
      rationale text,
      inspired_by text,
      occasion text,
      weather text,
      time_of_day text,
      is_saved boolean DEFAULT false,
      is_ai_suggested boolean DEFAULT true,
      times_worn integer DEFAULT 0,
      created_at timestamp with time zone DEFAULT now(),
      base_fragrance_id uuid,
      top_fragrance_id uuid,
      formulation jsonb
    );

    ALTER TABLE public.layering_combinations ENABLE ROW LEVEL SECURITY;

    CREATE POLICY lc_select_own ON public.layering_combinations
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY lc_insert_own ON public.layering_combinations
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY lc_update_own ON public.layering_combinations
      FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY lc_delete_own ON public.layering_combinations
      FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF to_regclass('public.layering_combinations') IS NOT NULL THEN
    ALTER TABLE public.layering_combinations ENABLE ROW LEVEL SECURITY;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'layering_combinations'
        AND column_name = 'created_by_id'
    )
    THEN
      DROP POLICY IF EXISTS "Allow authenticated insert as owner" ON public.layering_combinations;
      CREATE POLICY "Allow authenticated insert as owner"
        ON public.layering_combinations
        FOR INSERT
        WITH CHECK (auth.uid() IS NOT NULL AND created_by_id = auth.uid());
    END IF;

    DROP POLICY IF EXISTS "Allow select for authenticated" ON public.layering_combinations;
    CREATE POLICY "Allow select for authenticated"
      ON public.layering_combinations
      FOR SELECT
      USING (auth.uid() IS NOT NULL);

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'layering_combinations'
        AND column_name = 'created_by_id'
    )
    THEN
      DROP POLICY IF EXISTS "Allow update by owner" ON public.layering_combinations;
      CREATE POLICY "Allow update by owner"
        ON public.layering_combinations
        FOR UPDATE
        USING (created_by_id = auth.uid())
        WITH CHECK (created_by_id = auth.uid());

      DROP POLICY IF EXISTS "Allow delete by owner" ON public.layering_combinations;
      CREATE POLICY "Allow delete by owner"
        ON public.layering_combinations
        FOR DELETE
        USING (created_by_id = auth.uid());

      CREATE INDEX IF NOT EXISTS idx_layering_combinations_created_by_id
        ON public.layering_combinations (created_by_id);
    END IF;
  END IF;
END
$$;
