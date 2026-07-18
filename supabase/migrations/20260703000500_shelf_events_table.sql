-- Epic 13: Insights Dashboard — Shelf event log for taste evolution tracking
--
-- Original body here created a legacy anon_id/event_type shape referencing
-- public.profiles(anon_id), which doesn't exist on production (verified via
-- Supabase MCP, 2026-07-18) — this CREATE TABLE would abort a fresh replay
-- immediately. app/api/shelf/route.ts, app/api/blind-ranking/reveal/
-- route.ts, and app/(main)/shelf/page.tsx all insert user_id/event/
-- old_rank/new_rank, which is what's actually live (id bigint identity,
-- user_id uuid, fragrance_id uuid, event text, old_rank/new_rank int,
-- created_at, single "own rows" ALL policy on auth.uid() = user_id). Same
-- rewrite already applied to PR64's copy of this file.

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
