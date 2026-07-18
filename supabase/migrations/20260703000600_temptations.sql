-- Temptations feature — subtle commerce trigger cards
--
-- Original body here created a legacy anon_id/trigger_reason/first_shown_at
-- shape with a status set that excludes 'shown' and 'blind_buy' — /api/
-- temptations (GET/POST/PATCH) reads/writes reason/shown_at/resolved_at,
-- inserts only user_id with status 'shown', and maps a buy action to
-- 'blind_buy'. Verified against the live production table (Supabase MCP,
-- 2026-07-18), which already has exactly that shape (user_id uuid, reason
-- text, status default 'shown' with a check allowing shown/viewed/
-- wishlisted/blind_buy/maybe_later/dismissed, shown_at/resolved_at) and a
-- single "own rows" ALL policy on auth.uid() = user_id — no insert-open
-- policy. Same phantom-object pattern as shelf_events/handle_new_user:
-- the real table was created directly against production, and this
-- migration's original body never matched it.
--
-- Guarded on the table not already existing, same reasoning as
-- shelf_events: a bare CREATE TABLE would abort with "relation already
-- exists" on production and block this migration version from ever
-- applying there. CREATE POLICY has no IF NOT EXISTS form, so the whole
-- body is wrapped in one DO block.

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

  -- DATE_TRUNC('week', timestamptz) alone isn't immutable (it depends on
  -- the session's timezone setting), which Postgres rejects in an index
  -- expression — converting to a fixed 'UTC' timestamp first makes the
  -- whole expression immutable.
  --
  -- DATE_TRUNC('week', ...) buckets ISO-style, Monday-start weeks, but
  -- app/api/temptations/route.ts computes weekStart as the most recent
  -- Sunday (`today - getUTCDay()` — Sunday is day 0). Shifting the
  -- timestamp forward a day before truncating, then back a day after,
  -- re-buckets it to the same Sunday-start week the route uses — without
  -- this, a Sunday row is bucketed into next week by Postgres while the
  -- route still considers it this week, so the API's weekly-cap check and
  -- this unique index can disagree at the boundary (missed 500 vs. a
  -- false 429).
  CREATE UNIQUE INDEX idx_temptations_user_id_week
    ON public.temptations(user_id, (DATE_TRUNC('week', (shown_at AT TIME ZONE 'UTC') + interval '1 day') - interval '1 day'))
    WHERE status = 'shown';
END
$$;
