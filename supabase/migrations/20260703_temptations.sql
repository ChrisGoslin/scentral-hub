-- Temptations feature — subtle commerce trigger cards
-- Tracks user temptation events with max 1 active per week per user

CREATE TABLE public.temptations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id text NOT NULL,
  fragrance_id uuid NOT NULL REFERENCES fragrances ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'viewed', 'wishlisted', 'bought', 'dismissed')) DEFAULT 'pending',
  trigger_reason text,  -- 'repeat_revisit', 'wishlist_age', 'blind_rank_match'
  first_shown_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS — users can only see/modify their own temptations
ALTER TABLE public.temptations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own temptations"
  ON public.temptations FOR SELECT
  USING (anon_id = current_setting('app.current_anon_id', true) OR anon_id IS NOT NULL);

CREATE POLICY "Users can update own temptations"
  ON public.temptations FOR UPDATE
  USING (anon_id = current_setting('app.current_anon_id', true))
  WITH CHECK (anon_id = current_setting('app.current_anon_id', true));

CREATE POLICY "System can insert temptations"
  ON public.temptations FOR INSERT
  WITH CHECK (true);

-- Indexes for query performance
CREATE INDEX idx_temptations_anon_id ON public.temptations(anon_id);
CREATE INDEX idx_temptations_fragrance_id ON public.temptations(fragrance_id);
CREATE INDEX idx_temptations_status ON public.temptations(status);
CREATE INDEX idx_temptations_created_at ON public.temptations(created_at DESC);
CREATE INDEX idx_temptations_anon_id_created_at ON public.temptations(anon_id, created_at DESC);

-- Composite index for weekly dedup check
CREATE UNIQUE INDEX idx_temptations_anon_id_week
  ON public.temptations(anon_id, DATE_TRUNC('week', created_at))
  WHERE status = 'pending';
