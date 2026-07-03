-- Description enrichment queue — batch generation & review workflow
-- Tracks AI-generated descriptions pending human review before insertion into fragrances table

CREATE TABLE public.description_enrichment_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fragrance_id uuid NOT NULL UNIQUE REFERENCES fragrances ON DELETE CASCADE,
  generated_description text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending_review', 'approved', 'rejected')) DEFAULT 'pending_review',
  reviewed_by text,  -- admin identifier, if reviewed
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS — system can insert/read all, admins can review
ALTER TABLE public.description_enrichment_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage enrichment queue"
  ON public.description_enrichment_queue
  USING (true)
  WITH CHECK (true);

-- Indexes for query performance
CREATE INDEX idx_enrichment_status ON public.description_enrichment_queue(status);
CREATE INDEX idx_enrichment_fragrance_id ON public.description_enrichment_queue(fragrance_id);
CREATE INDEX idx_enrichment_created_at ON public.description_enrichment_queue(created_at DESC);
CREATE INDEX idx_enrichment_status_created_at ON public.description_enrichment_queue(status, created_at DESC);
