-- DB-004: wishlist consolidation
-- STATUS: DRAFT — NOT APPLIED. Per CLAUDE.md §11.6 ("Migrations: SHOW SQL, wait
-- for explicit approved before applying"), do not run this against the live DB
-- without explicit founder approval.
--
-- Verified live (Supabase MCP, 2026-08-24, project lrkdwobnemczvhpixpky):
--   - collections has NO unique constraint on (user_id, fragrance_id) — a user
--     can have multiple rows for the same fragrance today.
--   - lib/auth/claimLegacyData.ts already contains `claimLegacyWishlist()`,
--     which upserts `scentral_wishlist` localStorage entries into
--     `collections(status='wishlist')` with `onConflict: 'user_id,fragrance_id'`.
--     That onConflict target requires a real unique constraint to exist —
--     it does not today, so calling this function as written would throw a
--     Postgres error ("there is no unique or exclusion constraint matching
--     the ON CONFLICT specification"). This is the root blocker for DB-004,
--     not missing product logic.
--   - `claimLegacyWishlist` is exported but has ZERO callers anywhere in
--     app/ or components/ (grep confirmed) — it is dead code today. The only
--     wired claim path is `claimLegacyData` (server-side, called from
--     app/auth/callback/route.ts), which only migrates anon_id-keyed rows on
--     temptations/shelf_events/evolution_events/noseprint_history — it does
--     NOT touch localStorage (it can't; it's a server route) and does not
--     call claimLegacyWishlist.
--
-- Plan:
--   1. Dedupe any existing (user_id, fragrance_id) duplicates before adding
--      the constraint — keep the "strongest" status per pair (owned >
--      past_purchase > tested > wishlist) so a user who has since owned a
--      fragrance doesn't get demoted back to wishlist by a stale duplicate row.
--   2. Add the unique constraint the existing upsert code already assumes.
--   3. Wire the dead `claimLegacyWishlist` call into a client-side boundary
--      that runs once after login (see code-change note below) — this is an
--      application code change, not a migration, and can ship independently
--      once the constraint lands.

-- ── Step 1: dedupe existing rows, keeping the strongest status per
-- (user_id, fragrance_id) pair ──────────────────────────────────────────────
WITH ranked AS (
  SELECT
    id,
    user_id,
    fragrance_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, fragrance_id
      ORDER BY
        CASE status
          WHEN 'owned' THEN 1
          WHEN 'past_purchase' THEN 2
          WHEN 'tested' THEN 3
          WHEN 'wishlist' THEN 4
          ELSE 5
        END,
        created_at ASC
    ) AS rn
  FROM collections
  WHERE fragrance_id IS NOT NULL
)
DELETE FROM collections
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ── Step 2: enforce one row per (user, fragrance) going forward ────────────
ALTER TABLE collections
  ADD CONSTRAINT collections_user_fragrance_unique UNIQUE (user_id, fragrance_id);

-- ── Step 3 (code, not SQL — shown here for review alongside the schema
-- change per the task instruction; apply as a normal PR, not a migration):
--
-- New file: components/auth/WishlistClaimBoundary.tsx ('use client')
--   useEffect(() => {
--     if (!user) return
--     claimLegacyWishlist(supabaseBrowserClient, user.id)
--   }, [user])
--
-- Mount it once, high in the authenticated tree (e.g. app/(main)/layout.tsx
-- or wherever the session/user is already resolved client-side) — deliberately
-- NOT done in this pass since app/(main)/layout.tsx is shared surface outside
-- Track F's scope and touching it risks colliding with concurrent sibling
-- agents. Whoever picks this up should also delete the now-redundant
-- `scentral_wishlist` localStorage reads in WardrobeShelf.tsx, YouClient.tsx,
-- InsightsPanel.tsx, and DiscoverClient.tsx once collections(status='wishlist')
-- is confirmed as the sole source of truth, and update CLAUDE.md §3/§5 to
-- retire the "dual wishlist" note.
