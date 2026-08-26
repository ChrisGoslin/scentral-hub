# nota. — Recommendations & Pre-Launch Backlog (Deliverable E)

> Phase 4, 2026-07-04. Synthesis of Deliverables A–D. Ordered by dependency, then leverage.
> **Updated 2026-08-26** (backlog-clearance sibling-agent effort, branch `claude/backlog-clearance-sibling-agents-7zt8vb`, Tracks A–F): rows 2, 5, 6 (partial), 7, 9, 11 confirmed done/shipped; row 8 migrations drafted-but-not-applied (pending approval); row 10 GDPR minimum done; domain cutover (§1b) remains fully blocked on human dashboard action. See CLAUDE.md §12 Phase log entry for the same date for the full verification summary.

## 1. The pre-launch critical path (do in this order)

| # | Item | Refs | Status (2026-08-26) | Why this order |
|---|---|---|---|---|
| 1 | **DB-001/002 migrations** (statuses + blind_buy) — approve & apply | DB-001,002 | ✅ Applied (approved earlier, per Phase log) | Everything in rows 2–5 consumes them |
| 2 | **Shelf v2**: 20 slots, S/A/B/C tier rows, eligibility-filtered search, BB stamp, DB-003 trigger (+ seed-row backfill) | DB-003,007 UX-003/004/005 DS-005 | ✅ Confirmed already-shipped (tier/blind_buy wired end-to-end in `ShelfClient.tsx`/`shelf/page.tsx`; CLAUDE.md §6 corrected) | The brief's flagship feature |
| 3 | **Nav rebuild** around the loop: `Today / Discover / My Shelf / Traces / You` + lowercase `nota.` wordmark | UX-001,008 B§1 | Not touched this pass (deferred — product decision) | Makes the product findable; cheap once Shelf v2 defines "My Shelf" |
| 4 | **Landing detox**: keep identity hero, move Inspired-By engine to `/clones`, rewrite marquee in house voice, nota. metadata | UX-002,013 B§6 | Not touched this pass (deferred — brand voice sign-off) | First impression = doctrine |
| 5 | **Shelf share artefact**: OG card route + "share to Traces" + completion moment | UX-006 | ✅ Done (`app/api/og/shelf/route.tsx`, Track F) | The loop's "connects me" beat; infra exists |
| 6 | **Token discipline sweep** (Read/Shelf/landing) + humanist sans swap + a11y faint-text fix | DS-001,002,006 | Partial — no font-family/palette changes made this pass (out of scope); not claimed done | Do alongside 2–4 while touching those files |
| 7 | **"I tried something" capture** (Tested flow, 30s) | UX-007 | ✅ Done (`components/collection/TriedSomethingSheet.tsx` + `app/api/collection/tested/route.ts`, Track F) | Depends on DB-001; the store-tester journey's front door |
| 8 | **Server-side Read regen cap + DB-004 wishlist consolidation + swap schema (DB-005)** | D§3, DB-004/005 | Read regen cap ✅ confirmed done (e2e coverage added, Track C). DB-004/DB-005 SQL **drafted but NOT applied** — sitting in `docs/nota/pending-migrations/`, awaiting explicit "approved" per Rule 6 | Hardening + schema-now-UI-later |
| 9 | **Security headers + Vercel Firewall bot rules + rate limits on `/api/search`·`/api/read/generate`·`/api/og/*`** | F§2.4, F§3.1 | ✅ Done (`/api/og/template` + `/api/og/shelf` rate-limited, Track B) | Dashboard + config work; must precede public traffic |
| 10 | **GDPR minimum**: PostHog consent gating, privacy-page truthing, DSAR delete script (verify FK cascades) | F§2.6 | ✅ Done | Must precede notalabs.io DNS cutover (EU exposure) |
| 11 | **RLS adversarial suite + CI Stage 2/3** (build + chromium e2e, needs repo secrets) | F§1.2, F§2.1 | ✅ Done — `scripts/rls-adversarial-suite.mjs` (Track B) + CI Stage 2/3 live + 6 new Playwright specs added (Track C, see §4). Suite surfaced two real RLS gaps, see §8 below | Proves the migrations in rows 1–2; CI Stage 1 (tsc+lint) already live |

Post-launch queue (still open/deferred — this pass didn't touch these): 'close' Read adjustment (UX-009), evolution ceremony (UX-010), discover feel-first sections (UX-011), swap UI + trust tooling (UX-012), daylight theme (DS-007), anon→auth XP claim (DB-006), interactions retention, and the 6 value-add micro-interactions in §2.

### 1c. Portability concierge follow-ups — added 2026-07-27

1. **Clean generated build backups** — remove `.next.preverify-20260726-archive-import` and `.next.preverify-20260727-clean-e2e` after confirming no active debugging session needs them.
2. **Real authenticated preview API integration test** — ✅ Done 2026-08-26: `tests/portability/preview-route.test.mjs` (Track D) covers `401`, `415`, oversized-body rejection, happy-path preview, and asserts no database writes.
3. **Approved commit/import tranche** — design and implement the separate write step only after explicit approval. Required properties: idempotency, authenticated ownership, audit log, rollback receipt, and a visible customer review step before writes. **Still not started** — no code in this pass touches the write step.

### 1b. Domain cutover — notalabs.io (purchased 2026-07-04 via Shopify)

**Status 2026-08-26: still fully blocked on human action.** No code change is needed on the app side beyond the env var in step 3 — every step below requires someone with Vercel/Shopify dashboard access to act. This pass did not and could not move it.

Run in this order; the app needs no code changes beyond one env var:
1. Vercel → project → Settings → Domains → add `notalabs.io` (+ `www.notalabs.io`). Vercel displays the required A/CNAME values.
2. Shopify admin → Domains → `notalabs.io` → DNS settings → add those records (apex A → Vercel's IP; `www` CNAME → Vercel's target). Remove Shopify's default storefront routing for the apex if it was auto-pointed at a Shopify store.
3. After DNS propagates and Vercel shows the domain valid: set `NEXT_PUBLIC_SITE_URL=https://notalabs.io` in Vercel env (all environments) → redeploy. This flips metadataBase, OG image URLs, and Noseprint share links at once.
4. Repoint `scripts/smoke-test.mjs` BASE_URL default + `package.json` `test:smoke:prod` → `https://notalabs.io`; run the smoke suite against it.
5. Keep `scentral-hub.vercel.app` as a permanent redirect to the new domain (Vercel does this automatically once the custom domain is primary).
6. Unblocked by the domain: AWIN merchant applications (Notino/Douglas want a live branded site) and the Shopify storefront envs for /boxes checkout.


## 2. Value-add micro-interactions (doctrine-reinforcing, all small)

1. **The dot as loading state in The Read** — replace "Reading your signals…" pulse with the drifting dot (B§2). The system's tell becomes consistent: when the dot moves, nota. is thinking.
2. **Recognition line on repeat views** — fragrance detail visited ≥3 times: one serif line, *"Third time you've come back to this one."* (data already in `interactions`). This is the cheapest "it understands me" moment in the whole backlog.
3. **Shelf completion breath** — when the last slot fills: 480ms settle, then *"Twenty bottles. One nose."* + share affordance. No confetti — a breath, not a party.
4. **C-tier honesty** — C-tier row header reads *"On the edge."*; items 30+ days unworn get a quiet fade toward `--nota-whisper`. Evolution made visible without nagging.
5. **BB stamp reveal** — when a blind-buy lands in S-tier, stamp animates once (settle verb): *"The gamble paid off."*
6. **Empty wishlist shelf** — atmospheric shop-shelf illustration with one serif line: *"Nothing calling to you yet."* — not a grey e-commerce empty state.

## 3. Non-negotiable violations found → fixes

| Violation (doctrine) | Where [V] | Fix |
|---|---|---|
| Salesy/price-war voice | Landing Inspired-By section, PressMarquee copy | Backlog #4 |
| "If it's not personalised, it shouldn't exist" | `/social` static embeds; generic discover grid | Deprecate/fold to Trails (UX-014); UX-011 |
| Loud display type as body (anti-restraint) | Unbounded everywhere | DS-002 |
| Brand name integrity | "nota." all-caps nav; nota. metadata | Backlog #3–4 (metadata fixed in this session's diffs) |
| Enforce-in-model rule | Shelf eligibility only visual (nonexistent) | DB-003 |

## 4. Recommended Playwright specs (critical uncovered flows)

Existing e2e coverage: collection, discover, layering, onboarding, you-tab — **nothing covers Read, Shelf, Blind Ranking, or Traces** [V — e2e/ listing]. Specs to write (use `getByRole`, not copy strings — L17):

1. **Shelf capacity & eligibility:** user with 5 eligible fragrances can fill 5 slots; adding an ineligible fragrance is blocked with clear messaging (once DB-003 lands); 21st add is impossible.
2. **Shelf reorder persistence:** drag slot 3 → slot 1; reload; order persists; `shelf_events` row exists.
3. **Blind ranking lock:** placed choice cannot be changed; reveal only fires after all placements; choices persist into the session page.
4. **The Read happy path:** feelings → generate (mock the API) → reveal renders all five identity parts → reaction saves a noseprint row → redirect to /noseprint.
5. **Read regen cap:** 'Not me' regenerates once; second 'Not me' saves instead of regenerating.
6. **Trace post:** compose → appears in feed → reaction increments.
7. **Signed-out shelf:** shows sign-in state, never a broken grid.

**Status 2026-08-26:** all 6 specs above written and landed (Track C): `e2e/shelf-capacity-eligibility.spec.ts`, `e2e/shelf-reorder-persistence.spec.ts`, `e2e/blind-ranking-lock.spec.ts`, `e2e/read-happy-path.spec.ts`, `e2e/read-regen-cap.spec.ts`, `e2e/trace-post.spec.ts`. CI Stage 2 (build) and Stage 3 (chromium e2e) are now live.

## 8. RLS findings flagged for human review — added 2026-08-26 (Track B, `scripts/rls-adversarial-suite.mjs`)

Neither of these was introduced by this pass — both are pre-existing gaps the new adversarial suite surfaced. Flagging, not fixing, per Rule 6 (migrations need explicit approval):

1. **`feedback` table policy name/behavior mismatch.** Policy is named "Anyone can read own feedback" but its `qual` is `true` — it is actually public-read, not owner-scoped. Any authenticated user can read any other user's feedback rows. Needs a human decision: rename the policy to reflect actual (public) behavior, or restrict it to `auth.uid() = user_id` if feedback was meant to be private. **Open question for the founder/product owner.**
2. **`user_xp` / `user_streaks` legacy anon-keyed RLS.** Both tables carry `USING (true)` SELECT policies (anon_id-text era, not user_id-uuid), so any authenticated caller can read all rows across all users. This is a known, pre-existing consequence of the dual identity model documented in `nota-identity-consolidation-campaign` — not new, but now has an automated regression check (`scripts/rls-adversarial-suite.mjs`) so it won't go unnoticed again.

## 5. What was changed in this session (safe diffs applied)

- `CLAUDE.md` — created as nota. system memory (Phase 0).
- `docs/nota/01–05` — this audit suite.
- `app/layout.tsx` + `app/page.tsx` — display-layer rebrand to nota. (metadata, OG, footer), tone-aligned descriptions. *Display strings only; no logic.*
- `app/(main)/shelf/ShelfClient.tsx` — heading "The Shelf" → "My Shelf" (brief-sanctioned rename).
- Verified with `npm run build` (see session report).

**Explicitly NOT done without approval:** all migrations (SQL shown in Deliverable D §2 — awaiting "approved"); nav restructure (product decision on Wardrobe/Collection naming — UX-008); font swap (licence/choice decision); marquee copy rewrite (brand voice sign-off).

## 6. Honest gaps & assumptions register

- No Figma/design-system source exists; Brand Pack §1–2 (wordmark, dot machine) are **proposals**, not extractions.
- nota. handover doc and "New changes.md" competitive teardown were not in the repo; doctrine derives solely from the founder brief. If fuller docs exist, re-run Phase 2 against them.
- `/insights`, `/you`, onboarding, `/wheel`, `/spritz` were surveyed but not deep-audited (breadth trade-off); their scores in A§3 are code-informed, not pixel-inspected.
- Palette lock (PRODUCT_TRUTH 🟡 #1) still pending founder decision — colour recommendations marked [T].
- Live walkthrough was signed-out only; signed-in Shelf/Read states were audited from code, not the browser.

## 7. Audit follow-up note

- Lighthouse production score landed at **71** on performance. The main visible drag is the long LCP path on the landing and Discover surfaces, not a single isolated route failure.
- Accessibility found contrast issues in the marquee / landing-copy area. Treat those as launch polish, but they are real enough to stay on the backlog until the copy and colour treatment are tightened.
