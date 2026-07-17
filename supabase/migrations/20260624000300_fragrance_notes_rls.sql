-- Enable RLS on fragrance_notes table
-- Allow public read access (Chemist API, drydown timelines, similarity scoring)
-- Restrict writes to authenticated service role

ALTER TABLE public.fragrance_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read fragrance_notes" ON public.fragrance_notes
  FOR SELECT
  USING (true);
