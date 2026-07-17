-- Reconcile insights_cache with the live production contract.
--
-- Discovered while reconciling trace_reactions (see
-- 20260717_align_trace_reactions_contract.sql): the checked-in
-- 20260703_insights_cache_table.sql migration describes a legacy
-- anon_id-keyed, five-jsonb-column shape. Live production has since been
-- migrated out-of-band to user_id/period/payload (verified via Supabase MCP
-- on 2026-07-17), but that change was never mirrored back into
-- supabase/migrations/. Idempotent: a no-op against a DB that already
-- matches production; transforms a DB still on the legacy shape.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'insights_cache'
  ) THEN
    CREATE TABLE public.insights_cache (
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      period text NOT NULL DEFAULT 'latest',
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      computed_at timestamp with time zone NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, period)
    );
  END IF;
END $$;

-- anon_id (text, FK profiles.anon_id) -> user_id (uuid, FK profiles.id).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'insights_cache' AND column_name = 'anon_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'insights_cache' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.insights_cache DROP CONSTRAINT IF EXISTS insights_cache_pkey;
    ALTER TABLE public.insights_cache ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

    UPDATE public.insights_cache ic
    SET user_id = p.id
    FROM public.profiles p
    WHERE p.anon_id = ic.anon_id;

    RAISE NOTICE 'insights_cache: % row(s) have no matching profile and will be permanently deleted (anon_id could not map to user_id)',
      (SELECT count(*) FROM public.insights_cache WHERE user_id IS NULL);

    DELETE FROM public.insights_cache WHERE user_id IS NULL;

    ALTER TABLE public.insights_cache ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE public.insights_cache DROP COLUMN anon_id;
  END IF;
END $$;

-- Five separate jsonb columns -> single `payload` jsonb + `period` key.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'insights_cache' AND column_name = 'your_impact'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'insights_cache' AND column_name = 'payload'
  ) THEN
    ALTER TABLE public.insights_cache ADD COLUMN period text NOT NULL DEFAULT 'latest';
    ALTER TABLE public.insights_cache ADD COLUMN payload jsonb NOT NULL DEFAULT '{}'::jsonb;

    UPDATE public.insights_cache
    SET payload = jsonb_build_object(
      'your_impact', COALESCE(your_impact, '{}'::jsonb),
      'best_traces', COALESCE(best_traces, '[]'::jsonb),
      'scentiment_vision', COALESCE(scentiment_vision, '{}'::jsonb),
      'taste_evolution', COALESCE(taste_evolution, '[]'::jsonb),
      'trajectory', COALESCE(trajectory, '{}'::jsonb)
    );

    ALTER TABLE public.insights_cache DROP COLUMN your_impact;
    ALTER TABLE public.insights_cache DROP COLUMN best_traces;
    ALTER TABLE public.insights_cache DROP COLUMN scentiment_vision;
    ALTER TABLE public.insights_cache DROP COLUMN taste_evolution;
    ALTER TABLE public.insights_cache DROP COLUMN trajectory;
    ALTER TABLE public.insights_cache DROP COLUMN IF EXISTS updated_at;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'insights_cache_pkey' AND conrelid = 'public.insights_cache'::regclass
  ) THEN
    ALTER TABLE public.insights_cache ADD CONSTRAINT insights_cache_pkey PRIMARY KEY (user_id, period);
  END IF;
END $$;

DROP INDEX IF EXISTS public.idx_insights_cache_anon_id;

-- Realign RLS policies to the user_id-keyed contract (verified live shape:
-- a single owner-scoped ALL policy; the nightly job writes via the
-- service-role key, which bypasses RLS entirely).
DROP POLICY IF EXISTS "Users can view their own insights" ON public.insights_cache;
DROP POLICY IF EXISTS "Service role can write insights" ON public.insights_cache;
DROP POLICY IF EXISTS "Service role can update insights" ON public.insights_cache;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'own rows' AND polrelid = 'public.insights_cache'::regclass
  ) THEN
    CREATE POLICY "own rows" ON public.insights_cache FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.insights_cache ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_insights_cache_computed_at ON public.insights_cache(computed_at DESC);
