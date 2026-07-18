-- Epic 13: Insights Dashboard — Reaction tracking for traces and content
--
-- Original body here created a legacy trace_id-text/anon_id shape
-- referencing public.profiles(anon_id), which doesn't exist on production
-- (verified via Supabase MCP, 2026-07-18) — this CREATE TABLE would abort
-- a fresh replay immediately. Live production is trace_id uuid (FK
-- traces(id)), user_id uuid (FK profiles(id)), reaction text CHECK
-- (on_the_nose/feel_this/too_real), PRIMARY KEY (trace_id, user_id) — no
-- separate id column. Guarded on both traces and profiles existing since
-- this FKs to both.

DO $$
BEGIN
  IF to_regclass('public.trace_reactions') IS NOT NULL THEN
    RETURN;
  END IF;
  IF to_regclass('public.traces') IS NULL OR to_regclass('public.profiles') IS NULL THEN
    RETURN;
  END IF;

  CREATE TABLE public.trace_reactions (
    trace_id uuid NOT NULL REFERENCES public.traces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction text NOT NULL CHECK (reaction IN ('on_the_nose', 'feel_this', 'too_real')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (trace_id, user_id)
  );

  ALTER TABLE public.trace_reactions ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "reactions readable" ON public.trace_reactions
    FOR SELECT USING (true);

  CREATE POLICY "reactions own write" ON public.trace_reactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE INDEX idx_trace_reactions_trace_id ON public.trace_reactions(trace_id);
  CREATE INDEX idx_trace_reactions_created_at ON public.trace_reactions(created_at DESC);
END
$$;
