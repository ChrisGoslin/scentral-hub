-- Description enrichment queue — batch generation & review workflow
-- Tracks AI-generated descriptions pending human review before insertion into fragrances table
--
-- Original body here used a generated_description column and no name/brand.
-- supabase/functions/enrich-descriptions-batch/index.ts inserts name, brand,
-- and ai_description; the admin review UI and approval flow select/write
-- ai_description. Verified against the live production table (Supabase MCP,
-- 2026-07-18), which already has exactly that shape (fragrance_id, name,
-- brand, ai_description, status default 'pending_review', reviewed_at, no
-- reviewed_by/updated_at) plus a trigger that copies an approved
-- ai_description into fragrances.plain_description. No RLS policies exist
-- live — this table is only ever touched with the service-role key. Same
-- phantom-object pattern as shelf_events/temptations: rewritten to match
-- what's actually live.

CREATE TABLE public.description_enrichment_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fragrance_id uuid NOT NULL UNIQUE REFERENCES fragrances ON DELETE CASCADE,
  name text NOT NULL,
  brand text NOT NULL,
  ai_description text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.description_enrichment_queue ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.apply_enrichment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.fragrances set plain_description = new.ai_description where id = new.fragrance_id;
    new.reviewed_at := now();
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.reviewed_at := now();
  end if;
  return new;
end;
$function$;

CREATE TRIGGER description_enrichment_queue_approval
  BEFORE UPDATE ON public.description_enrichment_queue
  FOR EACH ROW EXECUTE FUNCTION public.apply_enrichment_approval();

-- Indexes for query performance
CREATE INDEX idx_enrichment_status ON public.description_enrichment_queue(status);
CREATE INDEX idx_enrichment_fragrance_id ON public.description_enrichment_queue(fragrance_id);
CREATE INDEX idx_enrichment_created_at ON public.description_enrichment_queue(created_at DESC);
CREATE INDEX idx_enrichment_status_created_at ON public.description_enrichment_queue(status, created_at DESC);
