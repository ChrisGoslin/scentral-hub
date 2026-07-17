-- 011_search_indexes.sql sorts before 20260507_initial_schema.sql (which
-- creates public.fragrances), so on a fresh replay it hits its own
-- to_regclass('public.fragrances') IS NULL guard and returns immediately —
-- none of its indexes are ever created on a new environment. On an
-- already-migrated database it likely already ran successfully before that
-- guard existed (migrations apply against an evolving database, not a
-- from-scratch replay), so it's presumably already indexed there. This
-- migration is version-ordered after the schema it depends on, so it
-- actually runs on fresh environments; CREATE INDEX IF NOT EXISTS makes it a
-- safe no-op anywhere the indexes already exist.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
  IF to_regclass('public.fragrances') IS NULL THEN
    RETURN;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_fragrances_name_trgm
    ON public.fragrances USING GIN (name gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS idx_fragrances_brand_trgm
    ON public.fragrances USING GIN (brand gin_trgm_ops);

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fragrances'
      AND column_name = 'plain_description'
  )
  THEN
    CREATE INDEX IF NOT EXISTS idx_fragrances_plain_description_trgm
      ON public.fragrances USING GIN (plain_description gin_trgm_ops);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fragrances'
      AND column_name = 'inspired_by'
  )
  THEN
    CREATE INDEX IF NOT EXISTS idx_fragrances_inspired_by_trgm
      ON public.fragrances USING GIN (inspired_by gin_trgm_ops);
  END IF;

  -- app/api/search/route.ts also matches on full_name.ilike in the same OR
  -- query; without this index, full-name-only matches still scan.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fragrances'
      AND column_name = 'full_name'
  )
  THEN
    CREATE INDEX IF NOT EXISTS idx_fragrances_full_name_trgm
      ON public.fragrances USING GIN (full_name gin_trgm_ops);
  END IF;
END
$$;
