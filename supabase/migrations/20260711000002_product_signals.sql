-- Product Signal -> Weekly Product Brief pipeline. Raw feedback/usage
-- signals land here via POST /api/signals/ingest, then
-- scripts/generate_weekly_product_brief.ts clusters the last 7 days.

CREATE TABLE public.product_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  source text NOT NULL, -- 'form' | 'email' | 'dm' | ...
  raw_text text NOT NULL,
  summary text,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  persona_guess text,
  feature_area text,
  tags text[] DEFAULT '{}',
  metadata jsonb
);

CREATE INDEX idx_product_signals_created_at ON public.product_signals(created_at DESC);
CREATE INDEX idx_product_signals_source ON public.product_signals(source);
CREATE INDEX idx_product_signals_feature_area ON public.product_signals(feature_area);

ALTER TABLE public.product_signals ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: writes come from app/api/signals/ingest
-- (service-role key, server-side only); reads are the weekly brief script.
-- This table can carry raw user feedback text, so it stays service-role-only
-- by default rather than exposed to the anon/authenticated roles.
