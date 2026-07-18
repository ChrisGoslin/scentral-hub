-- Backfill: capture handle_new_user + its auth.users trigger, which were
-- created directly in the Supabase SQL editor and never checked into a
-- migration file. Reverse-engineered from the live production
-- function/trigger definitions (read via execute_sql, 2026-07-17).
--
-- public.profiles is itself not created by any migration in this repo —
-- same gap, and a hard blocker on a fresh replay: dependent tables
-- (insights_cache, trace_reactions, traces backfill above) FK to profiles
-- and abort if it doesn't exist yet. Backfilled here (right after
-- initial_schema, before anything that references it) instead of just
-- guarded away. profiles.house_id FKs to public.houses, which has the
-- same problem — backfilled first for the same reason. Both shapes
-- verified read-only against production via Supabase MCP, 2026-07-18.

DO $$
BEGIN
  IF to_regclass('public.houses') IS NULL THEN
    CREATE TABLE public.houses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      descriptor text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "houses readable" ON public.houses
      FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.profiles') IS NULL THEN
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id),
      display_name text,
      avatar_url text,
      created_at timestamp with time zone DEFAULT now(),
      username text UNIQUE,
      onboarding_completed_at timestamp with time zone,
      house_id uuid REFERENCES public.houses(id)
    );

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY profiles_owner ON public.profiles
      FOR ALL
      USING (auth.uid() = id);
  END IF;

  -- search_path = '' (not 'public'): 20260510_security_fixes.sql hardens
  -- this function's search_path on any environment where it already
  -- exists. On an existing database, that hardening migration is already
  -- recorded as applied and won't re-run — so if this backfill set
  -- search_path back to 'public', it would silently undo the hardening
  -- with nothing left to re-fix it. Setting the final hardened value
  -- directly is correct on both fresh and existing databases. Fully
  -- schema-qualified body (public.profiles) is required for this to work
  -- under an empty search_path.
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  begin
    insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
    on conflict (id) do nothing;
    return new;
  end
  $function$;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END
$$;
