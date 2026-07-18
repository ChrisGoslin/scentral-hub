-- Product Signal -> Weekly Product Brief pipeline. Raw feedback/usage
-- signals land here via POST /api/signals/ingest, then
-- scripts/generate_weekly_product_brief.ts clusters the last 7 days.

CREATE TABLE IF NOT EXISTS public.product_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
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
--
-- Because this table is reachable directly via the Supabase Data API with
-- the public anon key, a caller can bypass the route's IP rate limits
-- entirely and post straight to /rest/v1/product_signals. The size caps
-- below (mirroring MAX_SOURCE_LENGTH/MAX_TEXT_LENGTH/MAX_METADATA_BYTES in
-- the route) can't be bypassed that way even so — they're the one part of
-- the route's protection that a DB CHECK can enforce. Volumetric flooding
-- (many small valid rows) still isn't blocked at this layer; that requires
-- either revoking anon INSERT here and moving writes behind an RPC/Edge
-- Function, or a trigger-based per-IP counter, neither done here — tracked
-- as a known gap, not silently accepted.
-- summary/sentiment/persona_guess/feature_area/tags are derived analysis
-- output the app never sets on insert (route.ts only ever inserts source/
-- raw_text/tags:[]/metadata) — without constraining them here, a direct
-- Data API caller could plant fabricated enrichment fields that the weekly
-- brief then trusts and forwards to the LLM unredacted.
--
-- created_at is client-suppliable through the Data API like any other
-- column despite the DEFAULT now() — a caller could set it to NULL (now
-- blocked by NOT NULL) or a far-future timestamp, which would make
-- redact_old_product_signal_raw_text's `created_at < now() - retention`
-- predicate never select the row, leaving PII in raw_text/metadata
-- indefinitely. Constraining it to a narrow window around the actual
-- insert time closes that without needing to strip the column from the
-- client's control entirely.
CREATE POLICY "Allow anon insert" ON public.product_signals
  FOR INSERT
  TO anon
  WITH CHECK (
    length(source) <= 80
    AND length(raw_text) <= 12000
    AND (metadata IS NULL OR octet_length(metadata::text) <= 10000)
    AND summary IS NULL
    AND sentiment IS NULL
    AND persona_guess IS NULL
    AND feature_area IS NULL
    AND tags = '{}'
    AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '5 minutes'
  );

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
