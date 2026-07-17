-- Backfill: capture handle_new_user + its auth.users trigger, which were
-- created directly in the Supabase SQL editor and never checked into a
-- migration file. Reverse-engineered from the live production
-- function/trigger definitions (read via execute_sql, 2026-07-17).
--
-- public.profiles is itself not created by any migration in this repo
-- (same situation, out of scope to backfill here) — guard on its
-- existence so this still no-ops safely on a fresh preview branch that
-- replays history from scratch, and only takes effect where profiles
-- already exists (production, and any environment that already has it).

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RETURN;
  END IF;

  -- search_path = '' (not 'public'): this migration's version (20260507...)
  -- sorts before 20260510_security_fixes.sql, which hardens search_path to
  -- '' on any environment where handle_new_user already exists. On
  -- production, that hardening migration is already recorded as applied and
  -- won't re-run — so if this backfill set search_path back to 'public', it
  -- would silently undo the hardening with nothing to re-fix it afterward.
  -- Setting the final hardened value directly is correct either way. Fully
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
