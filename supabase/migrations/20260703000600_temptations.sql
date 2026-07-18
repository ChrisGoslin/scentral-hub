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
  -- If temptations already exists but is still in the legacy anon_id/
  -- trigger_reason/first_shown_at shape, convert it in place instead of
  -- treating "table exists" as "already reconciled" — DB-006 only adds
  -- user_id, it doesn't create reason/shown_at/resolved_at or replace the
  -- legacy status constraint, so the active API's selects and its
  -- status: 'shown' insert would keep failing on an upgraded database.
  IF to_regclass('public.temptations') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'temptations' AND column_name = 'anon_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'temptations' AND column_name = 'reason'
    ) THEN
      ALTER TABLE public.temptations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.temptations RENAME COLUMN trigger_reason TO reason;
      ALTER TABLE public.temptations RENAME COLUMN first_shown_at TO shown_at;
      ALTER TABLE public.temptations ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

      UPDATE public.temptations SET reason = 'unspecified' WHERE reason IS NULL;
      ALTER TABLE public.temptations ALTER COLUMN reason SET NOT NULL;
      ALTER TABLE public.temptations ALTER COLUMN shown_at SET NOT NULL;

      -- Legacy status set was pending/viewed/wishlisted/bought/dismissed;
      -- live is shown/viewed/wishlisted/blind_buy/maybe_later/dismissed.
      UPDATE public.temptations SET status = CASE status
        WHEN 'pending' THEN 'shown'
        WHEN 'bought' THEN 'blind_buy'
        ELSE status
      END;
      ALTER TABLE public.temptations ALTER COLUMN status SET DEFAULT 'shown';
      ALTER TABLE public.temptations DROP CONSTRAINT IF EXISTS temptations_status_check;
      ALTER TABLE public.temptations ADD CONSTRAINT temptations_status_check
        CHECK (status IN ('shown', 'viewed', 'wishlisted', 'blind_buy', 'maybe_later', 'dismissed'));

      DROP POLICY IF EXISTS "Users can view own temptations" ON public.temptations;
      DROP POLICY IF EXISTS "Users can update own temptations" ON public.temptations;
      DROP POLICY IF EXISTS "System can insert temptations" ON public.temptations;

      ALTER TABLE public.temptations DROP COLUMN anon_id;
      ALTER TABLE public.temptations DROP COLUMN IF EXISTS created_at;
      ALTER TABLE public.temptations DROP COLUMN IF EXISTS updated_at;

      CREATE POLICY "own rows" ON public.temptations
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

      CREATE INDEX IF NOT EXISTS idx_temptations_user_id ON public.temptations(user_id);
    END IF;

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
