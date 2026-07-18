-- Epic 13: Insights Dashboard — Shelf event log for taste evolution tracking
--
-- Original body here created a legacy anon_id/event_type shape that no
-- shelf writer has ever used. app/api/shelf/route.ts, app/api/blind-ranking/
-- reveal/route.ts, and app/(main)/shelf/page.tsx all insert user_id/event/
-- old_rank/new_rank — verified against the live production table (Supabase
-- MCP, 2026-07-18), which already has exactly that shape (id bigint
-- identity, user_id uuid, fragrance_id uuid, event text, old_rank/new_rank
-- int, created_at) and a single "own rows" ALL policy on auth.uid() =
-- user_id. Same phantom-object pattern as handle_new_user/profiles found
-- earlier: the real table was created directly against production at some
-- point, and this migration's original body never matched it. Rewritten to
-- match what's actually live rather than leave the app's shelf/blind-ranking
-- audit trail broken on any environment built from these migrations.
--
-- Guarded on the table not already existing: on production (or anywhere
-- this reconciliation has already run), a bare CREATE TABLE would abort
-- with "relation already exists" and block this migration version from
-- ever applying there. CREATE POLICY has no IF NOT EXISTS form, so the
-- whole body — table, policy, indexes — is wrapped in one DO block rather
-- than guarding each statement separately.

DO $$
BEGIN
  -- If shelf_events already exists but is still in the legacy anon_id/
  -- event_type shape (only reachable if some environment's profiles table
  -- once had an anon_id column, since that FK is what the legacy CREATE
  -- TABLE required to succeed at all), convert it in place instead of
  -- treating "table exists" as "already reconciled" and leaving writers
  -- silently failing against missing user_id/event/old_rank/new_rank.
  IF to_regclass('public.shelf_events') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'shelf_events' AND column_name = 'anon_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'shelf_events' AND column_name = 'event'
    ) THEN
      ALTER TABLE public.shelf_events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.shelf_events ADD COLUMN IF NOT EXISTS event text;
      ALTER TABLE public.shelf_events ADD COLUMN IF NOT EXISTS old_rank integer;
      ALTER TABLE public.shelf_events ADD COLUMN IF NOT EXISTS new_rank integer;

      -- Best-effort mapping from the legacy event_type enum to the live
      -- event enum — there's no old_rank/new_rank data to recover, only
      -- the action that happened.
      UPDATE public.shelf_events
      SET event = CASE event_type
        WHEN 'add' THEN 'added'
        WHEN 'remove' THEN 'removed'
        WHEN 'reorder' THEN 'rank_changed'
        ELSE event_type
      END
      WHERE event IS NULL;

      ALTER TABLE public.shelf_events ALTER COLUMN event SET NOT NULL;
      ALTER TABLE public.shelf_events ADD CONSTRAINT shelf_events_event_check
        CHECK (event IN ('added', 'removed', 'rank_changed', 'replaced', 'returned'));
      ALTER TABLE public.shelf_events DROP COLUMN anon_id;
      ALTER TABLE public.shelf_events DROP COLUMN IF EXISTS event_type;

      DROP POLICY IF EXISTS "Users can view their own shelf events" ON public.shelf_events;
      DROP POLICY IF EXISTS "Users can create shelf events" ON public.shelf_events;
      CREATE POLICY "own rows" ON public.shelf_events
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

      CREATE INDEX IF NOT EXISTS idx_shelf_events_user_id ON public.shelf_events(user_id);
    END IF;

    RETURN;
  END IF;

  CREATE TABLE public.shelf_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fragrance_id uuid NOT NULL REFERENCES public.fragrances(id) ON DELETE CASCADE,
    event text NOT NULL CHECK (event IN ('added', 'removed', 'rank_changed', 'replaced', 'returned')),
    old_rank integer,
    new_rank integer,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );

  ALTER TABLE public.shelf_events ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "own rows" ON public.shelf_events
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE INDEX idx_shelf_events_user_id ON public.shelf_events(user_id);
  CREATE INDEX idx_shelf_events_fragrance_id ON public.shelf_events(fragrance_id);
  CREATE INDEX idx_shelf_events_created_at ON public.shelf_events(created_at DESC);
  CREATE INDEX idx_shelf_events_event ON public.shelf_events(event);
END
$$;
