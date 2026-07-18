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
  IF to_regclass('public.shelf_events') IS NOT NULL THEN
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
