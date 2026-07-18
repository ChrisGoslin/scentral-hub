-- public.traces exists live (verified read-only via Supabase MCP, 2026-07-18:
-- columns, RLS policies, constraints, and indexes below) but no migration in
-- this repo creates it — 20260703_trace_reactions_table.sql and later
-- 20260717120000_align_trace_reactions_contract.sql both reference
-- traces(id) via FK without anything creating the table first. Same
-- phantom-object pattern as handle_new_user/profiles found earlier this
-- session. Guarded on profiles and fragrances (its FK targets) both
-- existing, so this only takes effect where they do — no-ops safely on a
-- fresh replay that hasn't reached them yet.

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL OR to_regclass('public.fragrances') IS NULL THEN
    RETURN;
  END IF;
  IF to_regclass('public.traces') IS NOT NULL THEN
    RETURN;
  END IF;

  CREATE TABLE public.traces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fragrance_id uuid REFERENCES public.fragrances(id),
    trace_type text NOT NULL DEFAULT 'fragrance' CHECK (trace_type IN ('fragrance', 'moment', 'emotional')),
    body text NOT NULL CHECK (char_length(body) <= 500),
    image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );

  CREATE INDEX traces_frag_idx ON public.traces (fragrance_id, created_at DESC);

  ALTER TABLE public.traces ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "traces readable" ON public.traces
    FOR SELECT USING (true);
  CREATE POLICY "traces own write" ON public.traces
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "traces own update" ON public.traces
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "traces own delete" ON public.traces
    FOR DELETE USING (auth.uid() = user_id);
END
$$;
