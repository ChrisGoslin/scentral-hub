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
--
-- Guarded on the table not already existing: on any environment where
-- description_enrichment_queue is already live in this exact shape (i.e.
-- production, or anywhere this reconciliation has already run), a bare
-- CREATE TABLE would abort with "relation already exists" and block this
-- migration version from ever applying there.
--
-- If the table already exists but is still in the legacy generated_
-- description shape (no name/brand/ai_description), convert it in place
-- instead of treating "table exists" as "already reconciled" — otherwise
-- enrich-descriptions-batch's inserts and the approval trigger's read of
-- new.ai_description keep failing against the legacy columns.
DO $$
BEGIN
  IF to_regclass('public.description_enrichment_queue') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'description_enrichment_queue' AND column_name = 'generated_description'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'description_enrichment_queue' AND column_name = 'ai_description'
    ) THEN
    ALTER TABLE public.description_enrichment_queue ADD COLUMN name text;
    ALTER TABLE public.description_enrichment_queue ADD COLUMN brand text;
    ALTER TABLE public.description_enrichment_queue RENAME COLUMN generated_description TO ai_description;

    UPDATE public.description_enrichment_queue deq
    SET name = f.name, brand = f.brand
    FROM public.fragrances f
    WHERE f.id = deq.fragrance_id AND deq.name IS NULL;

    -- Rows whose fragrance_id no longer resolves have no name/brand to
    -- backfill from — delete rather than leave them permanently violating
    -- the NOT NULL constraint added below.
    DELETE FROM public.description_enrichment_queue WHERE name IS NULL OR brand IS NULL;

    ALTER TABLE public.description_enrichment_queue ALTER COLUMN name SET NOT NULL;
    ALTER TABLE public.description_enrichment_queue ALTER COLUMN brand SET NOT NULL;
    ALTER TABLE public.description_enrichment_queue DROP COLUMN IF EXISTS reviewed_by;
    ALTER TABLE public.description_enrichment_queue DROP COLUMN IF EXISTS updated_at;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.description_enrichment_queue (
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

-- The original migration's "Service role can manage enrichment queue"
-- policy had no role or command restriction (USING (true) WITH CHECK
-- (true)), so it applied to every role, not just the service role —
-- CREATE TABLE IF NOT EXISTS above preserves it on an upgraded table
-- since it never touches existing policies. Dropped here so any role that
-- still has table privileges can't read/update queue rows and trigger the
-- SECURITY DEFINER approval flow that overwrites fragrances.
-- plain_description, bypassing the admin-passcode API entirely.
DROP POLICY IF EXISTS "Service role can manage enrichment queue" ON public.description_enrichment_queue;

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

DROP TRIGGER IF EXISTS description_enrichment_queue_approval ON public.description_enrichment_queue;
CREATE TRIGGER description_enrichment_queue_approval
  BEFORE UPDATE ON public.description_enrichment_queue
  FOR EACH ROW EXECUTE FUNCTION public.apply_enrichment_approval();

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_enrichment_status ON public.description_enrichment_queue(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_fragrance_id ON public.description_enrichment_queue(fragrance_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_created_at ON public.description_enrichment_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrichment_status_created_at ON public.description_enrichment_queue(status, created_at DESC);
