-- 001_enable_rls_layering_combinations.sql
-- Historical migration kept for compatibility with older databases. Some
-- preview branches replay this file before the migration that creates
-- public.layering_combinations, so guard every operation on table existence.

DO $$
BEGIN
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
