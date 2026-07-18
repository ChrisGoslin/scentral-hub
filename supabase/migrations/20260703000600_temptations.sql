-- Temptations feature — subtle commerce trigger cards
--
-- Original body here created a legacy anon_id/trigger_reason/first_shown_at
-- shape with a status set that excludes 'shown' and 'blind_buy' — /api/
-- temptations (GET/POST/PATCH) reads/writes reason/shown_at/resolved_at,
-- inserts only user_id with status 'shown', and maps a buy action to
-- 'blind_buy'. Verified against the live production table (Supabase MCP,
-- 2026-07-18; also documented in docs/HANDOVER.md as DB-006 already
-- applied), which already has exactly that shape (user_id uuid, reason
-- text, status default 'shown' with a check allowing shown/viewed/
-- wishlisted/blind_buy/maybe_later/dismissed, shown_at/resolved_at) and a
-- single "own rows" ALL policy on auth.uid() = user_id — no insert-open
-- policy. Same rewrite already applied to PR64's copy of this file.
--
-- Guarded on the table not already existing (CREATE POLICY has no IF NOT
-- EXISTS form, so the whole body is wrapped in one DO block) so it no-ops
-- wherever the table already exists in the verified live shape.

DO $$
BEGIN
  IF to_regclass('public.temptations') IS NOT NULL THEN
    RETURN;
  END IF;

  CREATE TABLE public.temptations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fragrance_id uuid NOT NULL REFERENCES fragrances ON DELETE CASCADE,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'shown' CHECK (status IN ('shown', 'viewed', 'wishlisted', 'blind_buy', 'maybe_later', 'dismissed')),
    shown_at timestamp with time zone NOT NULL DEFAULT now(),
    resolved_at timestamp with time zone
  );

  ALTER TABLE public.temptations ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "own rows" ON public.temptations
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE INDEX idx_temptations_user_id ON public.temptations(user_id);
  CREATE INDEX idx_temptations_fragrance_id ON public.temptations(fragrance_id);
  CREATE INDEX idx_temptations_status ON public.temptations(status);
  CREATE INDEX idx_temptations_shown_at ON public.temptations(shown_at DESC);
  CREATE INDEX idx_temptations_user_id_shown_at ON public.temptations(user_id, shown_at DESC);

  -- DATE_TRUNC('week', timestamptz) alone isn't immutable (session
  -- timezone dependent) — converting to a fixed 'UTC' timestamp first
  -- makes it immutable. Also shifted a day each direction to match
  -- app/api/temptations/route.ts's Sunday-start week (weekStart = today
  -- minus getUTCDay()), not Postgres's default Monday-start ISO week —
  -- same fix already applied on PR64.
  CREATE UNIQUE INDEX idx_temptations_user_id_week
    ON public.temptations(user_id, (DATE_TRUNC('week', (shown_at AT TIME ZONE 'UTC') + interval '1 day') - interval '1 day'))
    WHERE status = 'shown';
END
$$;
