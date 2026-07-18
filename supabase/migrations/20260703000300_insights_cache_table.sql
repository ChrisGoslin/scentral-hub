-- Epic 13: Insights Dashboard — Cache table for nightly computed insights
--
-- Original body here created a legacy anon_id-keyed, five-jsonb-column
-- shape referencing public.profiles(anon_id) — production has no anon_id
-- column on profiles at all (verified via Supabase MCP, 2026-07-18), so
-- this CREATE TABLE would abort immediately on any fresh replay with "there
-- is no unique constraint matching given keys for referenced table" before
-- anything else runs. Live production has already been migrated
-- out-of-band to user_id/period/payload. Rewritten to match what's
-- actually live, same phantom-object pattern as shelf_events/temptations
-- on PR64. Guarded so it no-ops on a database that already has this table.

DO $$
BEGIN
  IF to_regclass('public.insights_cache') IS NOT NULL THEN
    RETURN;
  END IF;
  IF to_regclass('public.profiles') IS NULL THEN
    RETURN;
  END IF;

  CREATE TABLE public.insights_cache (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period text NOT NULL DEFAULT 'latest',
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    computed_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, period)
  );

  ALTER TABLE public.insights_cache ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view their own insights"
    ON public.insights_cache FOR SELECT
    USING (auth.uid() = user_id);

  -- Owner-scoped, not "WITH CHECK (true)": app/api/insights/route.ts
  -- upserts through the user's own session client (not service-role), so
  -- an INSERT/UPDATE policy is genuinely needed here — but the original
  -- had no TO clause and no ownership check, so it applied to PUBLIC and
  -- let any anon or authenticated caller write an arbitrary payload for
  -- any user_id. compute-insights-nightly writes via the service role,
  -- which bypasses RLS regardless and needs no policy of its own.
  CREATE POLICY "Users can write their own insights"
    ON public.insights_cache FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own insights"
    ON public.insights_cache FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE INDEX idx_insights_cache_computed_at ON public.insights_cache(computed_at DESC);
END
$$;
