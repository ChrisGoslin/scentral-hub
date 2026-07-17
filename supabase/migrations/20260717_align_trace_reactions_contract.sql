-- Reconcile trace_reactions with the live production contract.
--
-- The checked-in 20260703_trace_reactions_table.sql migration describes a
-- legacy anon_id/reaction_type shape (felt/noted/saved). Live production has
-- since been migrated out-of-band to trace_id/user_id/reaction
-- (on_the_nose/feel_this/too_real), verified via Supabase MCP on 2026-07-17,
-- but that change was never mirrored back into supabase/migrations/. This
-- migration is idempotent: on a fresh DB built only from checked-in
-- migrations it transforms the legacy shape into the current contract; on a
-- DB that already matches production (the common case today) every step is
-- a documented no-op.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'trace_reactions'
  ) THEN
    CREATE TABLE public.trace_reactions (
      trace_id uuid NOT NULL REFERENCES public.traces(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      reaction text NOT NULL CHECK (reaction IN ('on_the_nose', 'feel_this', 'too_real')),
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      PRIMARY KEY (trace_id, user_id)
    );
  END IF;
END $$;

-- trace_id: legacy column was `text`; current contract is `uuid` FK to traces.id.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trace_reactions' AND column_name = 'trace_id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE public.trace_reactions
      ALTER COLUMN trace_id TYPE uuid USING trace_id::uuid;
  END IF;
END $$;

-- anon_id (text, FK profiles.anon_id) -> user_id (uuid, FK profiles.id).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trace_reactions' AND column_name = 'anon_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trace_reactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.trace_reactions ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

    UPDATE public.trace_reactions tr
    SET user_id = p.id
    FROM public.profiles p
    WHERE p.anon_id = tr.anon_id;

    -- Rows with no matching profile.id (anon_id never claimed) cannot be
    -- carried forward under the new user_id-keyed contract.
    RAISE NOTICE 'trace_reactions: % row(s) have no matching profile and will be permanently deleted (anon_id could not map to user_id)',
      (SELECT count(*) FROM public.trace_reactions WHERE user_id IS NULL);

    DELETE FROM public.trace_reactions WHERE user_id IS NULL;

    ALTER TABLE public.trace_reactions ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE public.trace_reactions DROP COLUMN anon_id;
  END IF;
END $$;

-- reaction_type (felt/noted/saved) -> reaction (on_the_nose/feel_this/too_real).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trace_reactions' AND column_name = 'reaction_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trace_reactions' AND column_name = 'reaction'
  ) THEN
    ALTER TABLE public.trace_reactions RENAME COLUMN reaction_type TO reaction;

    ALTER TABLE public.trace_reactions DROP CONSTRAINT IF EXISTS trace_reactions_reaction_type_check;

    -- Legacy values have no exact equivalent in the new vocabulary; map to
    -- the closest new value rather than silently dropping reaction rows.
    UPDATE public.trace_reactions SET reaction = 'feel_this' WHERE reaction = 'felt';
    UPDATE public.trace_reactions SET reaction = 'on_the_nose' WHERE reaction = 'noted';
    UPDATE public.trace_reactions SET reaction = 'too_real' WHERE reaction = 'saved';
  END IF;
END $$;

-- Ensure the current check constraint is in place regardless of path taken above.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trace_reactions_reaction_check' AND conrelid = 'public.trace_reactions'::regclass
  ) THEN
    ALTER TABLE public.trace_reactions
      ADD CONSTRAINT trace_reactions_reaction_check CHECK (reaction IN ('on_the_nose', 'feel_this', 'too_real'));
  END IF;
END $$;

-- Drop the legacy id surrogate key and switch the primary key to (trace_id, user_id).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trace_reactions' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.trace_reactions DROP CONSTRAINT IF EXISTS trace_reactions_pkey;
    ALTER TABLE public.trace_reactions DROP COLUMN id;
    ALTER TABLE public.trace_reactions ADD CONSTRAINT trace_reactions_pkey PRIMARY KEY (trace_id, user_id);
  END IF;
END $$;

-- Drop legacy anon_id-scoped indexes/constraint that no longer apply.
DROP INDEX IF EXISTS public.idx_trace_reactions_anon_id;
DROP INDEX IF EXISTS public.idx_trace_reactions_unique_reaction;

-- Realign RLS policies to the user_id-keyed contract (verified live shape).
DROP POLICY IF EXISTS "Users can view all reactions" ON public.trace_reactions;
DROP POLICY IF EXISTS "Users can create their own reactions" ON public.trace_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.trace_reactions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'reactions readable' AND polrelid = 'public.trace_reactions'::regclass
  ) THEN
    CREATE POLICY "reactions readable" ON public.trace_reactions FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'reactions own write' AND polrelid = 'public.trace_reactions'::regclass
  ) THEN
    CREATE POLICY "reactions own write" ON public.trace_reactions FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.trace_reactions ENABLE ROW LEVEL SECURITY;
