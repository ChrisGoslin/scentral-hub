-- Schema-only backfill: these six tables exist live in prod (scentral-mvp) with no
-- corresponding migration file in this repo — created out-of-band, never mirrored
-- back into supabase/migrations/. Idempotent: no-op on prod, brings a fresh DB build
-- to parity. See AGENTS.md §1 "Tables (ALL LIVE)" audit, 2026-08-09.

CREATE TABLE IF NOT EXISTS public.houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  descriptor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "houses readable" ON public.houses;
CREATE POLICY "houses readable" ON public.houses FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.layering_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  concept text,
  base_fragrance_name text NOT NULL,
  base_sprays integer NOT NULL,
  base_chemicals text,
  top_fragrance_name text NOT NULL,
  top_sprays integer NOT NULL,
  top_chemicals text,
  third_fragrance_name text,
  third_sprays integer,
  predicted_sillage text,
  predicted_hours text,
  occasion text,
  season text,
  anosmia_warning text,
  application_note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.layering_protocols ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "layering_protocols_public_read" ON public.layering_protocols;
CREATE POLICY "layering_protocols_public_read" ON public.layering_protocols FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.layering_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name text NOT NULL,
  source_file text NOT NULL,
  fragrance_names text[] NOT NULL DEFAULT '{}',
  roles text[] DEFAULT '{}',
  use_case text,
  rationale text,
  raw_text text NOT NULL,
  enriched jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_layering_patterns_source_file ON public.layering_patterns (source_file);
CREATE INDEX IF NOT EXISTS idx_layering_patterns_use_case ON public.layering_patterns (use_case);
ALTER TABLE public.layering_patterns ENABLE ROW LEVEL SECURITY;
-- No policies live in prod today — service-role only. Preserving that: no CREATE POLICY here.

CREATE TABLE IF NOT EXISTS public.product_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  source text NOT NULL,
  raw_text text NOT NULL,
  summary text,
  sentiment text CHECK (sentiment = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text])),
  persona_guess text,
  feature_area text,
  tags text[] DEFAULT '{}',
  metadata jsonb
);
CREATE INDEX IF NOT EXISTS idx_product_signals_created_at ON public.product_signals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_signals_source ON public.product_signals (source);
CREATE INDEX IF NOT EXISTS idx_product_signals_feature_area ON public.product_signals (feature_area);
ALTER TABLE public.product_signals ENABLE ROW LEVEL SECURITY;
-- No policies live in prod today — service-role only. Preserving that: no CREATE POLICY here.

CREATE TABLE IF NOT EXISTS public.trend_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_at timestamptz NOT NULL DEFAULT now(),
  topic text NOT NULL,
  entity text,
  source text NOT NULL,
  title text NOT NULL,
  url text,
  engagement jsonb NOT NULL DEFAULT '{}',
  relevance_score numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'published'::text, 'rejected'::text])),
  raw jsonb
);
CREATE INDEX IF NOT EXISTS idx_trend_signals_captured_at ON public.trend_signals (captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_trend_signals_topic_status ON public.trend_signals (topic, status);
ALTER TABLE public.trend_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trend_signals_public_read" ON public.trend_signals;
CREATE POLICY "trend_signals_public_read" ON public.trend_signals FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.fragrance_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fragrance_id uuid REFERENCES public.fragrances(id),
  brand text,
  name text NOT NULL,
  source_file text NOT NULL,
  top_notes text[] DEFAULT '{}',
  heart_notes text[] DEFAULT '{}',
  base_notes text[] DEFAULT '{}',
  accord_families text[] DEFAULT '{}',
  role text CHECK (role = ANY (ARRAY['anchor'::text, 'modulator'::text, 'top'::text])),
  raw_text text NOT NULL,
  enriched jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fragrance_facts_brand_name ON public.fragrance_facts (brand, name);
CREATE INDEX IF NOT EXISTS idx_fragrance_facts_role ON public.fragrance_facts (role);
CREATE INDEX IF NOT EXISTS idx_fragrance_facts_source_file ON public.fragrance_facts (source_file);
ALTER TABLE public.fragrance_facts ENABLE ROW LEVEL SECURITY;
-- No policies live in prod today — service-role only. Preserving that: no CREATE POLICY here.
