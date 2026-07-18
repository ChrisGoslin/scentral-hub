-- Add reaction stamp to collections
--
-- public.collections is itself not created by any migration in this repo —
-- 20260507_initial_schema.sql creates user_collection, a differently-named
-- and differently-shaped legacy table, not collections. This is the first
-- migration in file order that references collections, so it's backfilled
-- here (verified read-only against production via Supabase MCP,
-- 2026-07-18) rather than leaving the guard below permanently return early
-- on a fresh replay and letting 20260615_add_affinity_score.sql's
-- unconditional ALTER TABLE collections abort later.
DO $$
BEGIN
  IF to_regclass('public.collections') IS NULL THEN
    CREATE TABLE public.collections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id),
      fragrance_id uuid REFERENCES public.fragrances(id),
      status text DEFAULT 'owned' CHECK (status IN ('owned', 'tested', 'past_purchase', 'wishlist')),
      wear_state text DEFAULT 'new_spray' CHECK (wear_state IN ('new_spray', 'tester_skin', 'macerated_retest', 'full_wear')),
      shelf_tier integer DEFAULT 2 CHECK (shelf_tier >= 1 AND shelf_tier <= 4),
      maceration_started_at timestamp with time zone,
      maceration_ready_at timestamp with time zone,
      affinity_score integer DEFAULT 50 CHECK (affinity_score >= 0 AND affinity_score <= 100),
      personal_notes text,
      scent_memory text,
      created_at timestamp with time zone DEFAULT now()
    );

    ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

    CREATE POLICY collections_owner ON public.collections
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  ALTER TABLE public.collections
    ADD COLUMN IF NOT EXISTS reaction text CHECK (reaction IN ('liked', 'disliked', 'unworn'));

  -- origin_code: not present on production, but genuinely needed —
  -- app/(main)/collection/CollectionClientWrapper.tsx selects it and
  -- app/api/collection/add/route.ts inserts it ('B' for barcode-scanned
  -- additions). 'B'/'D'/'T'/'O'/'W' per that client's type union
  -- (Barcode/Discover/Trace/Onboarding/Wishlist, inferred from call sites).
  ALTER TABLE public.collections
    ADD COLUMN IF NOT EXISTS origin_code text CHECK (origin_code IN ('B', 'D', 'T', 'O', 'W'));

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'collections'
      AND column_name = 'user_id'
  )
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'collections'
        AND column_name = 'fragrance_id'
    )
  THEN
    CREATE UNIQUE INDEX IF NOT EXISTS collections_user_fragrance_idx
      ON public.collections (user_id, fragrance_id);
  END IF;
END
$$;
