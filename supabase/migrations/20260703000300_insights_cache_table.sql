-- Epic 13: Insights Dashboard — Cache table for nightly computed insights

CREATE TABLE public.insights_cache (
  anon_id text PRIMARY KEY REFERENCES public.profiles(anon_id) ON DELETE CASCADE,
  computed_at timestamp with time zone DEFAULT now(),
  your_impact jsonb DEFAULT '{}'::jsonb,
  best_traces jsonb DEFAULT '[]'::jsonb,
  scentiment_vision jsonb DEFAULT '{}'::jsonb,
  taste_evolution jsonb DEFAULT '[]'::jsonb,
  trajectory jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS for insights_cache
ALTER TABLE public.insights_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
  ON public.insights_cache FOR SELECT
  USING (anon_id = current_setting('app.current_anon_id', true));

CREATE POLICY "Service role can write insights"
  ON public.insights_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update insights"
  ON public.insights_cache FOR UPDATE
  USING (true);

-- Index on computed_at for cache staleness checks
CREATE INDEX idx_insights_cache_computed_at ON public.insights_cache(computed_at DESC);
