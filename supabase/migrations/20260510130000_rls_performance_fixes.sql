-- ============================================================
-- RLS performance fixes
-- Wrapping auth.uid() in (select auth.uid()) prevents Postgres
-- from re-evaluating it for every row scanned. On large tables
-- this can be a significant speedup.
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    CREATE POLICY "Users can view their own profile" ON public.profiles
      FOR SELECT USING ((select auth.uid()) = id);

    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING ((select auth.uid()) = id)
      WITH CHECK ((select auth.uid()) = id);
  END IF;

  IF to_regclass('public.fragrances') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'fragrances'
        AND column_name = 'created_by'
    )
  THEN
    DROP POLICY IF EXISTS "Authenticated users can add fragrances" ON public.fragrances;
    CREATE POLICY "Authenticated users can add fragrances" ON public.fragrances
      FOR INSERT TO authenticated
      WITH CHECK ((select auth.uid()) = created_by);
  END IF;

  IF to_regclass('public.collections') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users manage their own collection" ON public.collections;
    CREATE POLICY "Users manage their own collection" ON public.collections
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.wear_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users manage their own wear logs" ON public.wear_logs;
    CREATE POLICY "Users manage their own wear logs" ON public.wear_logs
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.layering_combinations') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users manage their own layering combos" ON public.layering_combinations;
    CREATE POLICY "Users manage their own layering combos" ON public.layering_combinations
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.spritz_schedules') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users manage their own spritz schedules" ON public.spritz_schedules;
    CREATE POLICY "Users manage their own spritz schedules" ON public.spritz_schedules
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.learning_notes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users manage their own learning notes" ON public.learning_notes;
    CREATE POLICY "Users manage their own learning notes" ON public.learning_notes
      FOR ALL USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END
$$;
