-- Add reaction stamp to collections
DO $$
BEGIN
  IF to_regclass('public.collections') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.collections
    ADD COLUMN IF NOT EXISTS reaction text CHECK (reaction IN ('liked', 'disliked', 'unworn'));

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'collections'
      AND column_name = 'user_id'
  )
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'collections'
        AND column_name = 'fragrance_id'
    )
  THEN
    CREATE UNIQUE INDEX IF NOT EXISTS collections_user_fragrance_idx
      ON public.collections (user_id, fragrance_id);
  END IF;
END
$$;
