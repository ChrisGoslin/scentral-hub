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

-- Composite index for weekly dedup check
CREATE UNIQUE INDEX idx_temptations_user_id_week
  ON public.temptations(user_id, DATE_TRUNC('week', shown_at))
  WHERE status = 'shown';
