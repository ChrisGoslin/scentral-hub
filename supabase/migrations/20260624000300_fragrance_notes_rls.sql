-- Enable RLS on fragrance_notes table
-- Allow public read access (Chemist API, drydown timelines, similarity scoring)
-- Restrict writes to authenticated service role

-- This file was re-versioned — on a database where the former
-- 20260624_fragrance_notes_rls.sql already created this policy, a bare
-- CREATE POLICY with the same name aborts (Postgres has no implicit
-- policy replacement). DROP POLICY IF EXISTS first.
ALTER TABLE public.fragrance_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read fragrance_notes" ON public.fragrance_notes;
CREATE POLICY "Public read fragrance_notes" ON public.fragrance_notes
  FOR SELECT
  USING (true);
