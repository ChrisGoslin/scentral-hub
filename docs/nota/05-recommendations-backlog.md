# nota. — Recommendations & Pre-Launch Backlog (Deliverable E)

> Phase 4, 2026-07-04. Synthesis of Deliverables A–D. Ordered by dependency, then leverage.

## 1. The pre-launch critical path (do in this order)

| # | Item | Refs | Why this order |
|---|---|---|---|
| 1 | **DB-001/002 migrations** (statuses + blind_buy) — approve & apply | DB-001,002 | Everything in rows 2–5 consumes them |
| 2 | **Shelf v2**: 20 slots, S/A/B/C tier rows, eligibility-filtered search, BB stamp, DB-003 trigger (+ seed-row backfill) | DB-003,007 UX-003/004/005 DS-005 | The brief's flagship feature |
| 3 | **Nav rebuild** around the loop: `Today / Discover / My Shelf / Traces / You` + lowercase `nota.` wordmark | UX-001,008 B§1 | Makes the product findable; cheap once Shelf v2 defines "My Shelf" |
| 4 | **Landing detox**: keep identity hero, move Inspired-By engine to `/clones`, rewrite marquee in house voice, nota. metadata | UX-002,013 B§6 | First impression = doctrine |
| 5 | **Shelf share artefact**: OG card route + "share to Traces" + completion moment | UX-006 | The loop's "connects me" beat; infra exists |
| 6 | **Token discipline sweep** (Read/Shelf/landing) + humanist sans swap + a11y faint-text fix | DS-001,002,006 | Do alongside 2–4 while touching those files |
| 7 | **"I tried something" capture** (Tested flow, 30s) | UX-007 | Depends on DB-001; the store-tester journey's front door |
| 8 | **Server-side Read regen cap + DB-004 wishlist consolidation + swap schema (DB-005)** | D§3, DB-004/005 | Hardening + schema-now-UI-later |

Post-launch queue: 'close' Read adjustment (UX-009), evolution ceremony (UX-010), discover feel-first sections (UX-011), swap UI + trust tooling (UX-012), daylight theme (DS-007), anon→auth XP claim (DB-006), interactions retention.

### 1b. Domain cutover — notalabs.io (purchased 2026-07-04 via Shopify)

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
| Brand name integrity | "BASENOTE" all-caps nav; BaseNote metadata | Backlog #3–4 (metadata fixed in this session's diffs) |
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

## 5. What was changed in this session (safe diffs applied)

- `CLAUDE.md` — created as nota. system memory (Phase 0).
- `docs/nota/01–05` — this audit suite.
- `app/layout.tsx` + `app/page.tsx` — display-layer rebrand BaseNote → nota. (metadata, OG, footer), tone-aligned descriptions. *Display strings only; no logic.*
- `app/(main)/shelf/ShelfClient.tsx` — heading "The Shelf" → "My Shelf" (brief-sanctioned rename).
- Verified with `npm run build` (see session report).

**Explicitly NOT done without approval:** all migrations (SQL shown in Deliverable D §2 — awaiting "approved"); nav restructure (product decision on Wardrobe/Collection naming — UX-008); font swap (licence/choice decision); marquee copy rewrite (brand voice sign-off).

## 6. Honest gaps & assumptions register

- No Figma/design-system source exists; Brand Pack §1–2 (wordmark, dot machine) are **proposals**, not extractions.
- nota. handover doc and "New changes.md" competitive teardown were not in the repo; doctrine derives solely from the founder brief. If fuller docs exist, re-run Phase 2 against them.
- `/insights`, `/you`, onboarding, `/wheel`, `/spritz` were surveyed but not deep-audited (breadth trade-off); their scores in A§3 are code-informed, not pixel-inspected.
- Palette lock (PRODUCT_TRUTH 🟡 #1) still pending founder decision — colour recommendations marked [T].
- Live walkthrough was signed-out only; signed-in Shelf/Read states were audited from code, not the browser.
