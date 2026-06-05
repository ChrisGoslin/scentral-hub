-- Add direct fragrance FK columns so MVP save doesn't require a collections row
ALTER TABLE public.layering_combinations
  ADD COLUMN IF NOT EXISTS base_fragrance_id  uuid REFERENCES public.fragrances(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS top_fragrance_id   uuid REFERENCES public.fragrances(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS formulation        jsonb;

CREATE INDEX IF NOT EXISTS idx_lc_base_fragrance_id ON public.layering_combinations (base_fragrance_id);
CREATE INDEX IF NOT EXISTS idx_lc_top_fragrance_id  ON public.layering_combinations (top_fragrance_id);

-- Replace overly-broad ALL policy with split policies that include explicit WITH CHECK
-- and use (select auth.uid()) to avoid per-row function calls
DROP POLICY IF EXISTS "layering_combinations_owner" ON public.layering_combinations;

CREATE POLICY "lc_select_own" ON public.layering_combinations
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "lc_insert_own" ON public.layering_combinations
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "lc_update_own" ON public.layering_combinations
  FOR UPDATE USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "lc_delete_own" ON public.layering_combinations
  FOR DELETE USING ((select auth.uid()) = user_id);
