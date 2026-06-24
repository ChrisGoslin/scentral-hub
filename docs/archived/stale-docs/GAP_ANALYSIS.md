# AnotherSense — Master Gap Analysis

> **Status:** Living scorecard. Created 2026-06-23.
> **Method:** Every "built" claim verified by reading the actual source file / DB table list — **not** by trusting documentation. Where docs and code disagree, **code wins.**
> **Companion docs:** [`PRODUCT_TRUTH.md`](PRODUCT_TRUTH.md) (canonical spec), [`FEATURE_ROADMAP.md`](FEATURE_ROADMAP.md), [`MONETIZATION_PLAN.md`](MONETIZATION_PLAN.md).

---

## ⚡ Decisions needed from Christopher (address these first)

| # | Decision | Recommendation | Why it blocks work |
|---|---|---|---|
| 1 | **Design system** — lock & activate which palette? | **Dark Ambient Material + Aura tokens as default**, activate now | 4 palettes coexist; intended one was written but never made default. No UI polish until locked. |
| 2 | **`/schedule` vs `/spritz`** — both are "daily ritual" | **Deprecate `/schedule`**, point nav at `/spritz` | Duplicate feature; BottomNav still links the legacy one. |
| 3 | **`/profile`** — hardcoded mock | **Delete & redirect → `/you`** (the real one) | Dead screen shipping fake "Christopher" data. |
| 4 | **Pro/billing** — fake checkout | Stay **beta-open** now, defer real Stripe to monetization phase | `/pro` button is a no-op; no Stripe dep. |
| 5 | **Monetization order** — ads vs affiliate vs Shopify | **Affiliate-first** (fastest revenue, data already exists) | Determines P2 sequencing. |
| 6 | **Google Drive legacy `app/`** — parallel auth prototype | Reconcile or **formally abandon** | Risk of two competing codebases. |

---

## PART A — What Was AGREED (scoped across docs)

**Routes scoped:** `/`, `/discover`, `/collection` + `/collection/[id]`, `/layering`, `/social`, `/you`, `/dna-match` (Pro), `/intelligence` (Pro), `/schedule` (Pro/legacy), `/spritz` (free), `/wheel` (free, NEW), `/ritual/[id]`, `/onboarding`, `/learning`, `/profile`, `/disclaimer`, `/waitlist`, `/privacy`, `/terms`, `/pro`.

**Core feature pillars agreed:**
- **Living Wardrobe / Apothecary Grid** — 4 affinity tiers (Top Signatures 16–20, Occasion Modifiers 8–15, Base Anchors 1–7, Holding Zone), dnd-kit drag reorder, `cabinetSnapshot` vision hook (never remove).
- **"Smells Like" proximity search** — 3-tier: exact → inspired-by clones → 70%+ note similarity.
- **Aura Spritz Schedule** — gamified daily ritual, swipe cards, XP (6 levels: 0/100/300/600/1000/1500) + streaks.
- **Fragrance Wheel** — 9-axis polar SVG, collection gap analysis, share-as-PNG.
- **6-persona identity engine** (`lib/personas.ts`).
- **PWA** — installable, offline.
- **Monetization (agreed-ish):** Pro tier via ProGate; Awin affiliate "Where to Buy" (post-launch); AdSense + Shopify storefront (proposed only).

**Design system (nominally agreed):** "AnotherSense Aura Design Language" — OKLCH tokens (`--aura`, `--xp-color`), motion tokens, Instrument Serif italic + Unbounded, glassmorphism. **Competes with 3 other palettes — see Part D.**

**Data:** 282 fragrances; tables `fragrances`, `collections` (+`scent_memory`), `wear_logs`, `layering_combinations`, `layer_recipes`, `spritz_schedules`, `profiles`, `waitlist`, `user_xp`, `user_streaks` — all verified live.

---

## PART B — What's IN PLACE (built & verified)

| Area | Status | Evidence |
|---|---|---|
| `/`, `/discover`, `/collection`+`[id]`, `/layering`, `/you` | ✅ Real, Supabase-backed | SSR fetch, real search/filter/drag |
| `/spritz` (free) + XP/streak engine | ✅ Real | `SpritzClient.tsx`, `/api/spritz/*` writes `user_xp`/`user_streaks` |
| `/dna-match`, `/intelligence`, `/schedule` | ✅ Real, Pro-gated | `getIsPro()` guards (recently fixed from dead-code bug) |
| `/social` | ✅ Real but **static/curated** | hardcoded verified TikTok/YouTube IDs (not a live feed) |
| `/scanner` (barcode) | ✅ Real | live camera, `lib/barcode.ts` |
| `/onboarding`, `/learning`, `/ritual/[id]`, `/waitlist`, legal | ✅ Real | |
| Community: `/creator`, `/creators/[username]`, `/wear-and-share` | ✅ Real (follower count hardcoded 0) | built but **unscoped & un-navigated** |
| **"Smells Like" search** | ✅ **Real, 3-tier** | `app/api/search/route.ts` + RPC `search_by_note_similarity` |
| Persona engine (6 personas) | ✅ Real | `lib/personas.ts` |
| Aura schedule logic | ✅ Real but **deterministic/template** (not LLM yet) | `lib/aura.ts` |
| DNA harmony scoring | ✅ Real, live Gemini | `/api/dna-match` |
| Affiliate links | ⚠️ Wired but **placeholder IDs** (`'scentral'`) | `lib/affiliates.ts` |
| PWA | ✅ Real | `manifest.json` + `sw.js` + `offline.html` + `PWARegistration` |
| Build health | ✅ `tsc --noEmit` clean | Next 16.2.9, React 19.2, 27 real API routes |

---

## PART C — What's MISSING / Stubbed / Broken

1. **`/wheel` (Fragrance Wheel) — DOES NOT EXIST.** No route/component/lib. Yet AGENTS.md §1 **and** §10 assert it as a live "NEW" route. Clearest scoped-but-unbuilt feature.
2. **`/profile` — 100% hardcoded mock.** No Supabase calls; literal `'76'`/`'Christopher'` strings, dead toggles & Sign-Out. Real profile = `/you`.
3. **`/pro` — non-functional.** Subscribe button `onClick={() => {}}`; **no Stripe dep** despite "Powered by Stripe" copy.
4. **Monetization — ~nothing real.** No AdSense/AdWords. No Shopify. Affiliate IDs placeholder. No `buy_link`/`affiliate_url` columns in schema.
5. **Aura "AI copy"** is template strings — fine, but don't market as AI yet.
6. **Pro gating footgun** — `getIsPro()` is one global env flag (`NEXT_PUBLIC_BETA_MODE`), not per-user. Caused 3 dead-code bugs already.
7. **Dead code to remove:** `app/(main)/you/YouClient.tsx.bak`, `app/lib/{harmonyEngine,presets,types}.ts` (orphans — real ones are top-level `lib/`), duplicate `public/manifest.webmanifest`.
8. **Creator `followerCount` hardcoded 0** — no followers table.

---

## PART D — Conflicts & Contradictions (ranked by impact)

1. **Design system: 4 incompatible palettes; intended one never activated.** Warm-cream (`#A0622A`/`#F7F3EE`) vs Dark Ambient M3 (`#0F172A`/`#06B6D4`, all 4 mockups) vs Aura amber-OKLCH (AGENTS.md) vs landing-specific (`#06070a`/`#F5B76A`). Dark Ambient tokens written into `[data-theme="dark"]` but never made default — **live app still renders warm cream.** TAD says "no Tailwind" while every Epic brief uses Tailwind.
2. **Two "canonical" spec files don't exist** — AGENTS.md cites `docs/specs/AnotherSense_Final_UX_Overhaul.md` and `docs/AnotherSense_Execution_Brief.md`; `find` confirms neither exists.
3. **4 competing Epic schemes with collisions** — SENSUS 1–5 vs AnotherSense 0–12 vs RELEASE_NOTES 7–12 vs Phase 0–8. Epic 9 = "Spritz" in one, "Aura Evolution" in another.
4. **Persona count 2 vs 3 vs 6, two *kinds* conflated** — customer personas (Gavan/Christopher) vs fragrance-identity personas (6 in `lib/personas.ts`). No doc names them distinctly.
5. **`/schedule` vs `/spritz` overlap** — see Decision #2.
6. **Free/Pro tier disagreement** — Spritz moved Pro→Free between docs; "Rotation Intelligence" Pro in one doc, absent in another.
7. **Fabrication-laden legacy files still live** — `GEMINI.md`, `docs/executive-suite/**`, `.claude/AGENT_LUNA.md` use AGENTS.md's own blocklisted terms ("Hegemony / Agent Luna / Morocco Demo / pgvector Resonance"). See [`archived/ARCHIVE_MANIFEST.md`](archived/ARCHIVE_MANIFEST.md).
8. **`architecture.md` badly stale** — 76 fragrances (real: 282), 3-tab nav (real: 5+), magic-link auth (real: no-auth).
9. **`DIRECTORY_STRUCTURE.md` stale** — lists non-existent `DynamicAura.tsx`/`ScentBloom.tsx`/`AccordCreator.tsx`.
10. **Epic "complete" status self-contradicts within 24h** — Playbook ✅ vs Handover 🔴 for same Epics 1–5.
11. **Parallel/legacy codebase in Google Drive** — `…/My Drive/Scentral/app/` + `20260529_phase_3_auth.sql` with auth components.
12. **CLAUDE.md / GEMINI.md / AGENTS.md describe three different "current sprints."**

---

*Parts E–G (reference-site features, monetization, tackle order) live in [`FEATURE_ROADMAP.md`](FEATURE_ROADMAP.md) and [`MONETIZATION_PLAN.md`](MONETIZATION_PLAN.md).*
