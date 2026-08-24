-- DB-005: swap schema — trust & safety follow-up
-- STATUS: DRAFT — NOT APPLIED. Per CLAUDE.md §11.6, wait for explicit
-- "approved" before running against the live DB.
--
-- Correction to docs/nota/04-architecture-plan.md §2.3: `swap_offers` is
-- ALREADY LIVE (verified via Supabase MCP, 2026-08-24, project
-- lrkdwobnemczvhpixpky) — columns id, from_user, to_user, wants_fragrance_id,
-- offers_fragrance_id, message, status, created_at, resolved_at, with RLS
-- policies "swap create own" / "swap participants read" / "swap respond"
-- already enforcing auth.uid() IN (from_user, to_user). The core DB-005 table
-- creation this file's name implies is done — do not recreate swap_offers.
--
-- What's still genuinely missing, per 04-architecture-plan.md §2.3's own
-- "Trust & safety (design now, even unbuilt)" note: a block-list table and a
-- report affordance. Neither exists live (grep + MCP table listing confirmed
-- no `%block%`-named table). This file drafts those two pieces plus a
-- per-user rate-limit note, so the trust/safety half of DB-005 isn't
-- silently dropped when the UI eventually ships.

-- ── user_blocks: one user muting another from swap offers ──────────────────
CREATE TABLE user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id),
  blocked_id uuid NOT NULL REFERENCES auth.users(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_blocks_no_self_block CHECK (blocker_id <> blocked_id),
  CONSTRAINT user_blocks_unique UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_blocks owner read" ON user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "user_blocks owner write" ON user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "user_blocks owner delete" ON user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- ── swap_reports: report affordance on any offer ────────────────────────────
CREATE TABLE swap_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_offer_id uuid NOT NULL REFERENCES swap_offers(id),
  reporter_id uuid NOT NULL REFERENCES auth.users(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE swap_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swap_reports reporter read" ON swap_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "swap_reports create own" ON swap_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- No UPDATE/DELETE policy for regular users by design — reports are
-- append-only from the reporting user's side; review/dismiss is an
-- admin-only action (service-role, not exposed via RLS).

-- ── Application-layer note (not SQL) ────────────────────────────────────────
-- Once the swap UI ships, the create-offer route must:
--   1. Reject an offer where either party has blocked the other
--      (check both directions in user_blocks before insert).
--   2. Rate-limit offers per user/day server-side (04-architecture-plan.md
--      §2.3 calls for this explicitly) — use the existing lib/rate-limit.ts
--      makeLimiter pattern, e.g. makeLimiter('swap-offer', 10, '1 d').
--   3. Never surface addresses in-app — swap completion stays off-platform
--      at launch, stated plainly in the UI copy (per architecture plan).
