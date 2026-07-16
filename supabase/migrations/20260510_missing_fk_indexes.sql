-- ============================================================
-- Missing foreign key indexes
-- ============================================================
-- Some preview branches replay these migrations against schemas where older
-- experimental tables/columns never existed. Guard each index so replay stays
-- additive rather than failing on absent legacy objects.

DO $$
BEGIN
  IF to_regclass('public.fragrances') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'fragrances'
        AND column_name = 'created_by'
    )
  THEN
    CREATE INDEX IF NOT EXISTS fragrances_created_by_idx
      ON public.fragrances (created_by);
  END IF;

  IF to_regclass('public.layering_combinations') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'layering_combinations'
        AND column_name = 'base_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS layering_combinations_base_collection_id_idx
        ON public.layering_combinations (base_collection_id);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'layering_combinations'
        AND column_name = 'top_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS layering_combinations_top_collection_id_idx
        ON public.layering_combinations (top_collection_id);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'layering_combinations'
        AND column_name = 'third_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS layering_combinations_third_collection_id_idx
        ON public.layering_combinations (third_collection_id);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'layering_combinations'
        AND column_name = 'fourth_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS layering_combinations_fourth_collection_id_idx
        ON public.layering_combinations (fourth_collection_id);
    END IF;
  END IF;

  IF to_regclass('public.learning_notes') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'learning_notes'
        AND column_name = 'wear_log_id'
    )
  THEN
    CREATE INDEX IF NOT EXISTS learning_notes_wear_log_id_idx
      ON public.learning_notes (wear_log_id);
  END IF;

  IF to_regclass('public.spritz_schedules') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'spritz_schedules'
        AND column_name = 'morning_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS spritz_schedules_morning_collection_id_idx
        ON public.spritz_schedules (morning_collection_id);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'spritz_schedules'
        AND column_name = 'midday_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS spritz_schedules_midday_collection_id_idx
        ON public.spritz_schedules (midday_collection_id);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'spritz_schedules'
        AND column_name = 'evening_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS spritz_schedules_evening_collection_id_idx
        ON public.spritz_schedules (evening_collection_id);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'spritz_schedules'
        AND column_name = 'night_collection_id'
    )
    THEN
      CREATE INDEX IF NOT EXISTS spritz_schedules_night_collection_id_idx
        ON public.spritz_schedules (night_collection_id);
    END IF;
  END IF;
END
$$;
