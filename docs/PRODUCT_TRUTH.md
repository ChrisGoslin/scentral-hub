# nota. — PRODUCT TRUTH (Canonical Spec)

> **Status:** Proposed single source of truth. Created 2026-06-23.
> **Purpose:** Replace the contradictory set of specs with ONE reconciled reference. Where this disagrees with older docs (nota. playbook, executive-suite, RELEASE_NOTES, architecture.md), **this wins.**
> **Grounding rule (from AGENTS.md):** if a fact is not in the repo, the code, or the DB, it is not a fact. Items still awaiting Christopher's call are marked **🟡 PENDING DECISION**.

---

## 1. Identity
- **Display name:** nota. **Repo:** `scentral-hub`. **DB:** `scentral-mvp` (`lrkdwobnemczvhpixpky`). Display-layer rebrand only.
- **Architecture:** Single product, **no auth for MVP** — identity via `scentral_anon_id` (localStorage UUID).
- **Stack (verified `package.json`):** Next.js 16.2.9 (App Router, route groups), React 19.2, Supabase JS 2.108 + `@supabase/ssr`, Tailwind 4, `@dnd-kit/*`, framer-motion, fuse.js, `@sentry/nextjs`, posthog-js, web-push, `@anthropic-ai/sdk`, `@google/genai`. **No Stripe.** Deployed Vercel → `scentral-hub.vercel.app`.
- **Data:** 282 fragrances.

## 2. Routes — canonical status

| Route | Tier | Built? | Notes |
|---|---|---|---|
| `/` | Free | ✅ | Hero + persona teasers + clones CTA |
| `/discover` | Free | ✅ | SSR search/filter, wires Smells-Like |
| `/collection`, `/collection/[id]` | Free | ✅ | Apothecary Grid, dnd-kit |
| `/layering` | Free | ✅ | Wizard + ChemistryCalculator |
| `/spritz` | Free | ✅ | Swipe cards, XP/streak engine |
| `/you` | Free | ✅ | **The real profile page** |
| `/social` | Free | ✅ | Curated/static TikTok-YouTube embeds |
| `/scanner` | Free | ✅ | Live barcode camera |
| `/onboarding`, `/learning`, `/ritual/[id]`, `/waitlist`, `/privacy`, `/terms`, `/disclaimer` | Free | ✅ | |
| `/dna-match` | **Pro** | ✅ | Live Gemini harmony scoring |
| `/intelligence` | **Pro** | ✅ | Radar/distribution dashboards |
| `/schedule` | **Pro/legacy** | ✅ | 🟡 **PENDING:** deprecate for `/spritz`? |
| `/creator`, `/creators/[username]`, `/wear-and-share` | Free | ✅ | Built but **not in nav** — add links |
| `/profile` | Free | ⚠️ stub | 🟡 **PENDING:** delete→redirect `/you`, or wire up |
| `/pro` | Free | ⚠️ stub | 🟡 **PENDING:** real Stripe, or hide |
| `/wheel` | Free | ❌ **NOT BUILT** | Scoped + mockup exists; needs building |

## 3. Feature pillars (canonical)
- **Living Wardrobe** — 4 affinity tiers; affinity 16–20 Top Signatures / 8–15 Occasion Modifiers / 1–7 Base Anchors / null Holding Zone. dnd-kit reorder. **Never remove `cabinetSnapshot` CustomEvent** (vision pipeline hook).
- **Smells Like search** — 3-tier (exact / inspired_by clones / note similarity via RPC `search_by_note_similarity`). Live.
- **Spritz Schedule** — swipe-to-log, XP 6 levels (0/100/300/600/1000/1500), streaks. Writes `user_xp` + `user_streaks` + `as_xp`/`as_streak` localStorage.
- **DNA Match** — Gemini harmony bands (Twin Resonance / Strategic Layering / Volatile Tension / Dissonance).
- **Fragrance Wheel** — 🟡 to build: 9-axis polar SVG + collection gap analysis + share PNG.
- **Aura** — currently deterministic rules (`lib/aura.ts`); Claude Haiku copy is *future*, not built. Don't market as AI.

## 4. Personas — TWO distinct systems (name them separately to end confusion)
- **Customer personas** (audience/marketing filter, `lib/personas.ts`): **Gavan** (newcomer, plain language) + **Christopher** (enthusiast, expert). 2 personas.
- **Scent-identity personas** (in-app onboarding result, `lib/personas.ts` — **canonical, code-verified, 6**): `velvet_intellectual`, `solar_minimalist`, `dark_alchemist`, `ritual_keeper`, `rebel_experimentalist`, `comfort_seeker`.
- These are different axes. Older docs citing "3 personas" (Velvet/Solar/Dark only) are **superseded** — code has 6.

## 5. Free / Pro split (canonical, code-verified)
- **Free:** Discover, Collection, Layering, You, Spritz, Social, Scanner, Wheel (when built).
- **Pro (ProGate, `getIsPro()`):** Intelligence, DNA Match, Schedule.
- **Current reality:** `getIsPro()` returns true only if `NEXT_PUBLIC_BETA_MODE === 'true'` — a **global** flag, not per-user (known footgun). Beta is currently open (all unlocked).

## 6. Design system — 🟡 PENDING DECISION #1
Four palettes exist; **recommendation: lock & activate Dark Ambient Material + Aura.** Until Christopher confirms, treat as proposed:
- **Base (Dark Ambient M3):** bg `#0F172A`, accent cyan `#06B6D4`, orchid `#A855F7`, amber `#FBBF24` (sparing). Glassmorphism surfaces.
- **Aura layer (OKLCH):** `--aura: oklch(0.72 0.08 60)`, `--aura-surface`, `--aura-border`, `--xp-color: oklch(0.78 0.14 85)`.
- **Motion:** `--motion-instant` 80ms / `--motion-responsive` 200ms / `--motion-ceremonial` 480ms / `--motion-organic` 800ms.
- **Type:** Instrument Serif italic (emotional/Aura) + Unbounded (nav/functional).
- Reference mockups: `mockups/01-design-system.html` … `04-landing-hero.html`.
- **Action on lock:** move Dark Ambient tokens from `[data-theme="dark"]` to `:root` (make default), reconcile the "no Tailwind" TAD rule (repo *does* use Tailwind 4 — TAD is wrong).

## 7. Database (verified live)
`fragrances` (282; `plain_description`, `inspired_by`, `family`, `projection`, `optimal_season`, `use_case`, `lean`, `image_url`) · `collections` (`affinity_score` 1–20, `scent_memory`) · `wear_logs` · `layering_combinations`, `layer_recipes` · `spritz_schedules` · `profiles`, `waitlist` · `user_xp` (`anon_id` PK, `total_xp`, `level`) · `user_streaks` (`anon_id` PK, `current_streak`, `longest_streak`, `last_worn_date`).
**`projection` valid values ONLY:** Beast Mode, Strong, Moderate, Medium, Weak.
**For monetization (not yet present):** `fragrances.similarity_score`, `buy_link`, `affiliate_url` — require a migration.

## 8. Superseded / do-not-trust docs
`architecture.md` (76 frags, 3-tab, magic-link — wrong on all 3) · `DIRECTORY_STRUCTURE.md` (lists non-existent components) · `GEMINI.md` + `docs/executive-suite/**` + `.claude/AGENT_LUNA.md` (fabrication lore) · RELEASE_NOTES Epic 7–12 numbering · nota. vs nota. vs Phase numbering — collapse to **one** scheme going forward (recommend the nota. feature names, drop numbering entirely in favour of this route table).
