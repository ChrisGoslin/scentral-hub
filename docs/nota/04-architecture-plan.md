# nota. — Architecture Modernisation Plan (Deliverable D)

> Phase 3, 2026-07-04. Evidence: live schema + RLS via Supabase MCP, API route reads, edge-function inventory, `lib/affiliates.ts` / `lib/shopify.ts`. **All SQL below is PROPOSED — nothing has been applied.** Labels: **[V]** verified, **[A]** assumption, **[T]** tentative.
> **Hardening companion (Phase 5):** RLS adversarial testing, security headers, rate limiting, and bot/scraper defence for everything in this plan now live in `06-testing-security-abuse.md` (§2 security, §3 abuse). Any migration from §2 below must run the RLS adversarial suite per the `security-hardening` skill.

## 1. Schema review — what's solid

- **RLS [V]:** owner-scoped `auth.uid() = user_id` ALL-policies on shelf_items/noseprints/temptations/blind_ranking/collections/trail_progress; traces world-readable + owner-writable; trails readable only when `published`. Correct shape for launch.
- **Event architecture [V]:** `shelf_events` (audit) + `interactions` (general event log) written on every shelf mutation — Insights and Evolution have the raw material they need. Keep this discipline for every new feature.
- **Async posture [V]:** 4 edge functions (`aura-advisory`, `compute-insights-nightly`, `detect-noseprint-evolution`, `enrich-descriptions-batch`) + cache tables (`aura_cache` 24h TTL, `insights_cache`, chemist/sommelier caches) + `description_enrichment_queue` with an admin review UI. This is exactly the precompute-and-cache pattern the budget demands.

## 2. Schema review — the gaps (proposed changes, in dependency order)

```json
[
  {"id":"DB-001","table":"collections","change":"widen status to ('owned','tested','past_purchase','wishlist') via CHECK constraint","reason":"Shelf eligibility (Tested/Own/Past-Purchase) is impossible today — only 'owned'/'wishlist' exist in code","risk":"low (additive; existing rows unaffected)","priority":"pre-launch"},
  {"id":"DB-002","table":"shelf_items","change":"add blind_buy boolean NOT NULL DEFAULT false","reason":"BB stamp (brief requirement); also queryable for Insights ('your blind buys outrank your researched buys')","risk":"low","priority":"pre-launch"},
  {"id":"DB-003","table":"shelf_items","change":"raise shelf to 20 ranks + tier as a GENERATED column + eligibility-enforcing trigger","reason":"S/A/B/C tiers derived from rank (no second source of truth); DB-level enforcement that only eligible fragrances shelve","risk":"medium (trigger logic; app SHELF_SIZE consts must change in same deploy)","priority":"pre-launch"},
  {"id":"DB-004","table":"collections","change":"migrate localStorage scentral_wishlist → collections(status='wishlist') one-time client sync","reason":"wishlist is split across two stores; swap/sharing needs it server-side","risk":"low","priority":"pre-launch"},
  {"id":"DB-005","table":"swap_offers (new)","change":"create swap tables (see §2.3)","reason":"Wishlist/Swap flow (brief scope); schema now, UI post-launch","risk":"low (new tables, RLS from day one)","priority":"pre-launch schema, post-launch UI"},
  {"id":"DB-006","table":"user_xp,user_streaks","change":"migrate anon_id text → user_id uuid (backfill via login-time claim)","reason":"last two tables on the legacy identity; Insights can't join XP to auth users","risk":"medium (needs claim flow for existing anon users)","priority":"post-launch"},
  {"id":"DB-007","table":"blind_ranking_choices","change":"add blind_buy propagation: choices placed into shelf via reveal set shelf_items.blind_buy=true when source='blind_ranking' and fragrance not in collections","reason":"BB provenance should flow automatically from the blind flow","risk":"low (app-layer, not schema)","priority":"pre-launch"}
]
```

### 2.1 DB-001 + DB-002 (safe, additive)
```sql
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_status_check;
ALTER TABLE collections ADD CONSTRAINT collections_status_check
  CHECK (status IN ('owned','tested','past_purchase','wishlist'));

ALTER TABLE shelf_items ADD COLUMN blind_buy boolean NOT NULL DEFAULT false;
```

### 2.2 DB-003 (the tier model — rank stays the single source of truth)
```sql
ALTER TABLE shelf_items ADD CONSTRAINT shelf_items_rank_range CHECK (rank BETWEEN -20 AND 20 AND rank <> 0);
-- (negative ranks permitted transiently: the reorder endpoint's two-phase update uses them [V])

ALTER TABLE shelf_items ADD COLUMN tier text GENERATED ALWAYS AS (
  CASE WHEN rank BETWEEN 1 AND 5 THEN 'S'
       WHEN rank BETWEEN 6 AND 10 THEN 'A'
       WHEN rank BETWEEN 11 AND 15 THEN 'B'
       WHEN rank BETWEEN 16 AND 20 THEN 'C'
  END
) STORED;

-- Eligibility: only Tested / Owned / Past-Purchase fragrances can shelve
CREATE OR REPLACE FUNCTION enforce_shelf_eligibility() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM collections c
    WHERE c.user_id = NEW.user_id AND c.fragrance_id = NEW.fragrance_id
      AND c.status IN ('owned','tested','past_purchase')
  ) THEN
    RAISE EXCEPTION 'fragrance not eligible for shelf (must be tested, owned, or past purchase)';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER shelf_eligibility BEFORE INSERT OR UPDATE OF fragrance_id ON shelf_items
  FOR EACH ROW EXECUTE FUNCTION enforce_shelf_eligibility();
```
**⚠️ Rollout note:** existing `shelf_items` rows seeded from noseprint matches may reference fragrances *not* in collections [V — seeding inserts matches directly]. Backfill those into `collections(status='tested')` before enabling the trigger, or the first replace breaks. App changes in the same deploy: `SHELF_SIZE` 10→20 in `app/(main)/shelf/page.tsx` + `app/api/shelf/route.ts`, and the shelf search sheet must filter to eligible fragrances (better UX than surfacing the DB error).

### 2.3 DB-005 (swap — schema reserved now, built later)
```sql
CREATE TABLE swap_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL REFERENCES auth.users(id),
  to_user uuid NOT NULL REFERENCES auth.users(id),
  wants_fragrance_id uuid NOT NULL REFERENCES fragrances(id),   -- from to_user's wishlist
  offers_fragrance_id uuid NOT NULL REFERENCES fragrances(id),  -- from from_user's collection
  message text CHECK (char_length(message) <= 280),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE swap_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "swap participants" ON swap_offers FOR SELECT USING (auth.uid() IN (from_user, to_user));
CREATE POLICY "swap create own" ON swap_offers FOR INSERT WITH CHECK (auth.uid() = from_user);
CREATE POLICY "swap respond" ON swap_offers FOR UPDATE USING (auth.uid() IN (from_user, to_user));
```
**Trust & safety (design now, even unbuilt):** swaps are *offers*, never payments — no money moves through nota. Rate-limit offers per user/day; block-list table before public launch of the feature; report affordance on every offer; usernames only (no addresses in-app — completion handled off-platform at launch, stated plainly in UI copy).

## 3. LLM / API usage audit [V]

| Call site | Pattern | Verdict |
|---|---|---|
| `/api/read/generate` | 1 Haiku call per user per Read, saved to `noseprints` | ✅ correct |
| Aura advisory | Edge function + `aura_cache` (24h, per fragrance+context) | ✅ correct |
| Insights | Nightly edge function → `insights_cache` | ✅ correct |
| Description enrichment | Batch edge fn + queue + human review | ✅ correct |
| Chemist/Sommelier | Cache tables | ✅ correct |

No per-fragrance or per-request LLM paths found. One hardening note: `/api/read/generate` regenerates on demand ('Not me' → retry, capped at 1 in the client) — cap it **server-side** too (count `interactions.event_type='read_generated'` per user per hour) so the cap survives a hostile client.

## 4. Image/asset strategy for 127,595 fragrances

**Reality check [V]:** URL-guess enrichment against Parfumo/Fragrantica yields ~0.09% (47 hits / 53k rows, 2026-07-03). The catalogue's tail will never have bottle photography. Strategy — three tiers:
1. **Default (100% coverage, £0):** family-gradient cards (`lib/familyGradients.ts` + tokens) — already built and genuinely on-brand. Treat as the *design*, not the fallback: add subtle per-fragrance variation (deterministic hash → gradient angle/grain) so 90k woody fragrances don't look identical.
2. **Head (~top 2–5k by `popularity_rank`):** real imagery worth pursuing — targeted enrichment with the existing admin review queue, plus `pending_contributions` for user-submitted bottle shots (moderated).
3. **Override:** `image_url` when present. Every new host → `next.config.ts` remotePatterns in the same commit (operational rule L16).

## 5. Affiliate / Shopify placeholder audit [V]

- **AWIN (`lib/affiliates.ts`):** clean. Publisher ID approved; merchant IDs `'PENDING'` gate `isActive`; links degrade to plain search URLs. Activation = paste merchant IDs + set env var. One fix: header comment says "nota.". One structural note: carousel affiliate slots (brief §2) should consume `getRetailersForMarket()` so slots light up automatically on merchant approval — no relaunch needed.
- **Shopify (`lib/shopify.ts`):** env-driven, warns + returns null when unconfigured, `/boxes` renders 9 seeded boxes [V — discovery_boxes rows]. Storefront API version pinned at `2024-07` — bump before launch.
- **Verdict:** both abstractions are future-proof; no rework needed before domain registration.

## 6. Performance & scale notes

- `fragrances` at 127k with GIN trigram indexes [V] — `/api/search` pattern already optimised (parallel ILIKE + conditional RPC). Fine.
- `/discover` first paint is client-fetched [V — empty a11y tree on load]; move page 1 of results into the server component (route is already `dynamic`).
- `interactions` is bigint-PK append-only — will grow unbounded; add a monthly partition or a 12-month retention policy before it matters (post-launch).
- Vercel: no long-running work in routes (all heavy paths are edge-function/cron) ✅. Keep it that way for Swap notifications (use `web-push`, already a dependency, from an edge function — not synchronous route work).
- **Deploy discipline:** GitHub auto-deploy unreliable — `npx vercel --prod` + check aliased URL (AGENTS.md §7) stands.

## 7. Identity-model resolution (the one architectural decision to make soon)

Auth-uuid (nota-era) vs `scentral_anon_id` text (XP/streaks) coexist [V]. Recommendation: **auth is canonical**; on first authenticated session, claim legacy rows (`user_xp`, `user_streaks`, localStorage wishlist → `collections`) then retire the anon path. Do the claim silently — nota. should *remember*, not ask users to migrate. **[T — needs founder sign-off on requiring sign-in for XP]**
