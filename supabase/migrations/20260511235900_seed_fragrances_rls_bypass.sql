-- Originally added an unrestricted "with check (true)" INSERT policy for
-- one-off seeding. That's a standing vulnerability if ever actually applied
-- (any role could insert arbitrary catalogue rows indefinitely, since
-- nothing dropped it afterward) — verified not currently live in production
-- (2026-07-17, read-only check via Supabase MCP). Seeding should go through
-- the service-role key instead, which bypasses RLS by design and needs no
-- public policy. Drop is defensive, in case this ever ran elsewhere.
DROP POLICY IF EXISTS "fragrances: temporary seed insert" ON public.fragrances;
