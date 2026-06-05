-- 001_enable_rls_layering_combinations.sql
-- Run this in Supabase SQL editor or include in migrations workflow

-- Enable Row Level Security
ALTER TABLE public.layering_combinations
  ENABLE ROW LEVEL SECURITY;

-- Allow inserts only when auth.uid() is present and created_by_id matches
CREATE POLICY "Allow authenticated insert as owner"
  ON public.layering_combinations
  FOR INSERT
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (created_by_id = auth.uid());

-- Allow selects for authenticated users (adjust to owner-only if desired)
CREATE POLICY "Allow select for authenticated"
  ON public.layering_combinations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow update/delete only by owner
CREATE POLICY "Allow update by owner"
  ON public.layering_combinations
  FOR UPDATE
  USING (created_by_id = auth.uid())
  WITH CHECK (created_by_id = auth.uid());

CREATE POLICY "Allow delete by owner"
  ON public.layering_combinations
  FOR DELETE
  USING (created_by_id = auth.uid());

-- Index helpful columns
CREATE INDEX IF NOT EXISTS idx_layering_combinations_created_by_id ON public.layering_combinations (created_by_id);
