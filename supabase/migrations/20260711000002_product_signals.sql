-- Product Signal -> Weekly Product Brief pipeline. Raw feedback/usage
-- signals land here via POST /api/signals/ingest, then
-- scripts/generate_weekly_product_brief.ts clusters the last 7 days.

CREATE TABLE IF NOT EXISTS public.product_signals (
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
-- app/api/signals/ingest/route.ts writes with the anon key + this INSERT-only
-- policy, not the service-role key: docs/nota/06-testing-security-abuse.md
-- §2.3 requires the service-role key never appear in an app/ code path.
-- No SELECT/UPDATE/DELETE policy exists for anon or authenticated, so a
-- caller can add a row but never read, modify, or delete any row (including
-- their own) — reads stay restricted to the weekly brief script, which runs
-- with the service-role key server-side.
CREATE POLICY "Allow anon insert" ON public.product_signals
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.redact_old_product_signal_raw_text(retention interval DEFAULT interval '7 days')
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  redacted_count integer;
BEGIN
  -- metadata is arbitrary client-supplied JSON from a public endpoint (not
  -- derived analysis output), so it can carry the same PII raw_text can —
  -- clear it alongside raw_text rather than letting it outlive the window.
  -- Checking raw_text alone for "already redacted" is a bypass: the same
  -- public endpoint lets a caller submit the literal marker string as text
  -- while still supplying real metadata, which would then never get
  -- cleared. Re-check both fields independently.
  UPDATE public.product_signals
  SET raw_text = '[redacted after retention window]',
      metadata = NULL
  WHERE created_at < now() - retention
    AND (raw_text <> '[redacted after retention window]' OR metadata IS NOT NULL);

  GET DIAGNOSTICS redacted_count = ROW_COUNT;
  RETURN redacted_count;
END;
$$;

COMMENT ON FUNCTION public.redact_old_product_signal_raw_text(interval)
  IS 'Redacts raw product signal text and metadata after the retention window while preserving derived analysis fields (summary/sentiment/tags) for weekly briefs.';
