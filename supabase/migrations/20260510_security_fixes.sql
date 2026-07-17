-- ============================================================
-- Security fixes
-- ============================================================
-- handle_new_user is created directly in the Supabase SQL editor
-- (never captured in a migration file), so guard on existence —
-- fresh preview branches that replay history from scratch won't
-- have it, but production and any environment where it was
-- manually created will still get hardened.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    -- 1. Fix handle_new_user: lock down the search_path so it cannot
    --    be hijacked by objects placed in schemas earlier in the path.
    ALTER FUNCTION public.handle_new_user()
      SET search_path = '';

    -- 2. Revoke direct execute access from anon and authenticated roles.
    --    handle_new_user is a trigger function — it should only be called
    --    by the trigger, never directly via the REST API.
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
  END IF;
END
$$;
