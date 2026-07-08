---
name: nota-failure-archaeology
description: "Chronicle of every major nota. (repo scentral-hub) investigation, dead end, rejected fix, and revert — symptom -> root cause -> evidence (commit hash/file) -> status. Load this BEFORE re-investigating a build failure, an image crash, a flaky e2e test, a suspiciously low/high fragrance count, an LLM-cost or billing question, or a low-yield batch script — to check whether it's already a settled battle. Do NOT use this for live debugging of a currently-slow/erroring prod route (use diagnose-prod-slowdown instead); do NOT use this for the prevention rules/checklists themselves (use branch-hygiene for the pre-push/build gate, grounded-agent-guardrails for the verify-before-asserting safeguards) — this skill is the history of WHY those rules exist, not the rules' current text."
---

# Skill: nota-failure-archaeology

## Plain-language why (for Christopher)
Every time an AI agent picks up this project fresh, it has no memory of what already went wrong. Left alone, it will re-discover the same bugs, re-propose the same rejected fixes, and re-waste the same hours — because nothing tells it "this was already tried, here's why it failed." This file is that memory. It is not a rulebook (branch-hygiene and grounded-agent-guardrails are the rulebooks); it is the case log that explains why those rules exist, so nobody re-fights a battle that is already settled.

## When to use / when NOT to use
| Situation | Use this skill? |
|---|---|
| "Why does the pre-push hook check for module-level `createClient()`?" | Yes — see Incident 1 |
| A prod route is slow or erroring right now | **No** — use `diagnose-prod-slowdown` |
| You need the current checklist before pushing/merging | **No** — use `branch-hygiene` |
| You need the current verify-before-asserting safeguards | **No** — use `grounded-agent-guardrails` |
| You're about to re-propose "let's use Google Custom Search for images" or "let's re-run the bulk image scraper" | Yes — see Incidents 6 and 7 first |
| You're about to trust a fragrance count, a doc claim, or an old feature name from memory | Yes — see Incident 4 and Known Fabrications |
| You're about to add a new LLM route or wonder why Gemini isn't used | Yes — see Incident 8 |

All commit hashes below were re-verified with `git show --stat <hash>` and `git log --oneline -200` against `/Users/christophergoslin/Projects/scentral-hub` on 2026-07-05. Re-run those commands yourself if this file feels stale — see Provenance section.

---

## Incident log

### 1. The 19+ consecutive Vercel build failures (2026-06-24 → 2026-06-25)
- **Symptom:** Every Vercel deploy failed for roughly 24 hours straight — 19+ builds in a row, per AGENTS.md §9 L15.
- **Root cause (two independent bugs, same underlying failure mode — nobody ran a local build before pushing):**
  1. `scripts/extend-library.ts` imported `cheerio`, which was never added to `package.json`. Next.js type-checks every `.ts` file reachable by `tsconfig.json` during build, so an unrelated one-off script broke the whole app build.
  2. `app/api/debug/image-audit/route.ts` and `app/api/reels/route.ts` both called `createClient()` at **module scope** (top-level `const supabase = createClient(...)`, not inside the request handler). This throws `supabaseKey is required` the instant Next.js evaluates the module at build time, if env vars aren't present in that build context — `tsc --noEmit` does NOT catch this, because it type-checks fine; the crash only happens at actual module evaluation.
- **Evidence:**
  - `8569de2` — "fix: exclude scripts/ from tsconfig to unblock Vercel builds" (excludes `scripts/` from `tsconfig.json` rather than adding the unused `cheerio` dependency).
  - `a0da222` — "fix: remove unauthenticated debug/image-audit route breaking build" (deleted the route outright — one-off debug tooling, no auth, no references anywhere in the app, not worth fixing in place).
  - `f4dfd79` — "fix: move createClient() inside handler in reels route" (moved the client instantiation inside the handler; also audited every other `app/api` route for the same pattern — likes/push routes were already correct).
  - `2ba9b99` — "feat: add pre-push hook to block broken builds before they reach main" (the actual fix: a `.husky/pre-push` hook blocking `tsc --noEmit` failures AND a column-0 `const x = createClient(...)` grep match in `app/api`).
  - AGENTS.md §9 **L15** has the full narrative, including a second lesson learned while building the fix itself: testing the hook with `git reset --hard HEAD~1` wiped unrelated uncommitted edits to AGENTS.md — use `git reset HEAD~1` (mixed, default) instead, never `--hard`, without first confirming via `git status` there's nothing uncommitted worth keeping.
- **Rejected/decoy fix:** Installing the hook at `.git/hooks/pre-push` — this repo's local git config sets `core.hooksPath=.husky`, so `.git/hooks/` is never consulted. Confirmed the hard way (a first install there silently never fired). Both `core.hooksPath` and `.husky/` contents are **local-only, never committed** — every fresh clone must run the two-command setup in AGENTS.md "Local Dev Setup" (`git config core.hooksPath .husky` + copy/chmod the hook).
- **Status: CLOSED.** Hook is live at `.husky/pre-push` (verify: `cat /Users/christophergoslin/Projects/scentral-hub/.husky/pre-push`). Do not re-propose "just run tsc in CI" as a full substitute — tsc alone does not catch this bug class (see root cause above).

### 2. `next/image` crash on unlisted hostname (2026-06-28)
- **Symptom:** The entire Discover page rendered "Something went wrong" for all users, all sessions — not a partial degradation, a full page crash caught by the React ErrorBoundary.
- **Root cause:** `scripts/enrich-images-wikidata.mjs` backfilled `image_url` with `upload.wikimedia.org` URLs. That hostname was not present in `next.config.ts`'s `remotePatterns`. `next/image` throws a **runtime** error on unconfigured hostnames — it does not degrade gracefully, and the bug is invisible to `npm run build` / `tsc --noEmit` because the hostname check happens at render time, not compile time.
- **Evidence:**
  - `9384361` — "fix: stop AI/scraped image mismatches, add legit Wikidata image source" (introduced the Wikidata enrichment script and reordered Discover's default query to surface fragrances with real photos first).
  - `75d8977` — "fix(config): add upload.wikimedia.org to next/image remotePatterns — Wikidata backfill urls were crashing Discover page" (the actual fix, same day the Wikidata script's URLs started appearing in production data).
  - AGENTS.md §9 **L16** — codifies the rule and notes the pre-push hook was extended to grep scripts touching `image_url` and block the push if a new domain is absent from the whitelist.
- **Status: CLOSED**, but the failure mode recurs by design every time a script writes a new external image host. **Rule: any script that writes `image_url` must add its source domain to `next.config.ts` `remotePatterns` in the same commit.** Verify current whitelist: `grep -n "remotePatterns" -A 30 /Users/christophergoslin/Projects/scentral-hub/next.config.ts`.

### 3. E2E text-selector breakage on copy changes (2026-06-28)
- **Symptom:** `e2e/discover.spec.ts` and `e2e/you-tab.spec.ts` were silently failing — caught only when the full Playwright suite was run, not by the build.
- **Root cause:** Both specs asserted literal UI copy strings that had since been rewritten: `'Fresh & Clean'` → renamed to `'Fresh'` (vibe chip label); `'See your scent profile.'` → replaced with `'Your identity is waiting.'` (You-page copy). Text-based selectors have zero resilience to copy edits.
- **Evidence:** AGENTS.md §9 **L17** (same commit batch as Incident 2 — copy and image work landed close together on 2026-06-28); fix commit `196f431` — "chore(safeguards): image hostname hook, L16+L17 lessons, e2e gate in branch-hygiene skill" bundles this lesson with Incident 2's.
- **Fix, two parts:** (1) prefer `getByRole()` / `aria-label` selectors over literal text where possible — they survive copy rewrites; (2) `branch-hygiene` SKILL.md now lists `npm run test:e2e -- --project=chromium` as mandatory before pushing whenever UI copy, headings, or placeholder text changed.
- **Status: CLOSED as a rule, but recurring by nature** — any future copy change to a page with text-selector-based specs can reintroduce this. Check `.claude/skills/branch-hygiene/SKILL.md` Step 4 for the current mandatory e2e-run condition before touching copy.

### 4. The stale-doc fabrications era (fragrance count: 282 vs 127,595; "Known Fabrications" list)
- **Symptom:** Different docs in the same repo asserted wildly different fragrance counts and product-era facts as if they were current: `docs/PRODUCT_TRUTH.md` still says **282 fragrances** and the brand name "AnotherSense"; `docs/architecture.md`-era docs described a 76-fragrance catalogue, a 3-tab nav, and magic-link auth — "wrong on all 3" per `docs/PRODUCT_TRUTH.md:69`.
- **Root cause:** The dataset grew through several distinct eras (76 → 282 → 127,195 after the 2026-06-24 Kaggle bulk-import, `907bf87` "feat: bulk-import 137,697 fragrances from 3 Kaggle datasets") and nobody updated every doc each time it changed. Agents reading an old doc and stating its number as current fact is exactly the failure `grounded-agent-guardrails` exists to prevent.
- **Evidence / current numbers (verify, do not trust this file either):**
  - `AGENTS.md:46` and `AGENTS.md:126` (Known Fabrications list) state **127,195** as the canonical count as of the 2026-06-24 import.
  - `CLAUDE.md` §5 (dated 2026-07-04, verified live via Supabase MCP) states **127,595** rows — a later, more-recently-verified count. Per `CLAUDE.md`'s own precedence note ("Where this disagrees with older docs... this wins"), **127,595 is the more current figure as of 2026-07-04**, but it too will drift.
  - `docs/PRODUCT_TRUTH.md:13` and `:64` still say **282** — this is a **known-stale fabrication-era artifact, do not cite it**.
  - `.claude/skills/grounded-agent-guardrails/SKILL.md` "Known Fabrications" section: "Morocco Marketplace Demo", "Resonance Engine / pgvector" (unless referring to the real `/dna-match` route), "Alchemist Knowledge Base / dossiers", "Agent Luna / Sovereign Focus Group", "Hegemony / Sovereignty / Shadow Branching / autopilot-shadow" as product framing, "Olfactory NFTs / Invisible Commerce", "Elite Council breakthrough" framing, and any specific fragrance count cited from memory instead of a live query.
  - `AGENTS.md:124-128` "Known fabrications — never reintroduce" — near-identical list, canonical location in the binding doc.
- **The actual fix, not a doc edit:** never cite a fragrance count (or any other decaying fact) from a doc at all — run `SELECT count(*) FROM fragrances` (via Supabase MCP `execute_sql` or `mcp__*__execute_sql`) and cite that. `grounded-agent-guardrails` §"Ground Truth (Scentral)" table exists specifically so future agents stop hardcoding numbers that go stale.
- **Status: OPEN as a doc-cleanup task** (`docs/PRODUCT_TRUTH.md` still uncorrected as of 2026-07-04 per `CLAUDE.md` §1 rebrand-debt note), **CLOSED as a process** (the guardrail and the "always query, never cite" rule are in place). Do not spend time "fixing" `docs/PRODUCT_TRUTH.md`'s number without checking whether that's the task you were actually asked to do — CLAUDE.md already documents the discrepancy and defers full doc reconciliation to a later phase.

### 5. The lore-purge revert — `be1b59f`
- **Symptom:** A large batch of speculative "asset sovereignty" and financial-terminology features/copy had been added, then had to be reverted.
- **Root cause:** Scope invention beyond source-of-truth docs — exactly the failure `grounded-agent-guardrails` S4 ("No scope/feature invention") exists to prevent. Terms like "Hegemony / Sovereignty" trace back to this era.
- **Evidence:** `be1b59f` — "revert: remove asset sovereignty and financial terminology" (2026-05-29), touching `PROJECTS.md`, `PR_DESCRIPTION.md`, `app/api/demo/save/route.ts`, `app/api/layering/save/route.ts`, `app/components/AudioChord.tsx`, `app/components/DemoSave.tsx`, `app/components/ScentBloom.tsx`, `app/components/SupabaseAuth.tsx`, `app/components/ToastProvider.tsx`, `app/globals.css`, `app/layering/LayeringClient.tsx`, `app/layering/LayeringResult.tsx`, and more (18 files total — verify with `git show --stat be1b59f`).
- **Status: CLOSED.** "Hegemony / Sovereignty / Shadow Branching / autopilot-shadow" as *product/feature* framing is a listed fabrication (see Incident 4) — never reintroduce. Note the one legitimate exception documented in `grounded-agent-guardrails`: a Gemini-authored meta-agent persona skill at `.gemini/skills/sovereign-orchestrator/` legitimately uses "Sovereign Orchestrator" as a **tool persona name**, not a nota. product feature — don't confuse the two if you see the string again.

### 6. Unauthenticated debug route breaking the build — `a0da222`
- **Symptom:** Part of the 19+ build-failure streak (Incident 1) — one specific route.
- **Root cause:** `app/api/debug/image-audit/route.ts` instantiated Supabase at module scope (same bug class as Incident 1) AND had no authentication and no references anywhere in the app — pure debug scaffolding left in place.
- **Evidence:** `a0da222` — "fix: remove unauthenticated debug/image-audit route breaking build" — 29 lines deleted, whole route removed rather than patched, because it wasn't worth keeping.
- **Status: CLOSED.** Lesson generalizes: before patching a broken debug/one-off route in place, check whether it's referenced anywhere (`grep -rn "image-audit"` style check) — deleting unused debug scaffolding can be faster and safer than fixing it.

### 7. ProGate unconditional — `359670f`
- **Symptom:** The `/schedule` page showed a Pro-gated empty/upsell state to ALL users, including non-Pro and Pro alike — real page content was unreachable.
- **Root cause:** `ProGate` was applied unconditionally instead of behind an actual `isPro` check — described in the commit message as "the same dead-code bug as intelligence/dna-match", implying this pattern (a gate component applied without its condition) recurred across at least three routes.
- **Evidence:** `359670f` — "fix: restore schedule page real content — ProGate was unconditional (same dead-code bug as intelligence/dna-match)" (2026-06-23), 18 insertions / 18 deletions in `app/(main)/schedule/page.tsx`.
- **Status: CLOSED for `/schedule`.** If you encounter a page that's mysteriously always showing its Pro-gated/locked state, check whether `ProGate` (or any conditional wrapper) is actually receiving a real condition rather than being hardcoded — this exact bug shape has happened at least 3 times (schedule, intelligence, dna-match per the commit message; only `schedule`'s fix commit was independently confirmed here — verify the other two with `git log --oneline --all -- app/api/intelligence app/api/dna-match` if you need their specific hashes).

### 8. Google Custom Search API closure — time sink
- **Symptom:** Hours spent troubleshooting Google Custom Search (CSE) API billing/configuration for `scripts/enrich-images-google.mjs`, when a working DuckDuckGo fallback already existed in a sibling script.
- **Root cause:** `scripts/fetch-fragrance-images.mjs` already had a DuckDuckGo Image Search fallback (`fetchFromDuckDuckGo`) that activates automatically when `GOOGLE_CUSTOM_SEARCH_API_KEY` / `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` are missing or the Google call fails — but this wasn't checked before time was spent on Google Cloud Console billing/API configuration for the separate `enrich-images-google.mjs` script.
- **Evidence (verified in repo):** `scripts/enrich-images-google.mjs` (Google CSE only, no fallback, "Free tier: 100 queries/day" per its header comment) vs `scripts/fetch-fragrance-images.mjs` (Google CSE with automatic DuckDuckGo fallback, `fetchFromDuckDuckGo` function, warns "Will bypass Google Search and use DuckDuckGo Image Search directly" when Google env vars are absent).
- **UNVERIFIED — the specific claim "Google CSE closed to new projects Jan 20 2026"** does not appear anywhere in this repo's commits, docs, or code comments as of 2026-07-05. This may be an external Google policy fact known to whoever compiled the dossier, but it is not repo-grounded. Do not restate it as verified fact without an external, dated source. Check with: `git log --all --oneline -i --grep="CSE\|google.*search"` (no matching commit message describes a closure) and `grep -rn "closed to new" /Users/christophergoslin/Projects/scentral-hub --include=*.md`.
- **Lesson (the part that IS verified):** before troubleshooting a third-party API's config/billing, check whether the script you're actually running has a working fallback already implemented — read the script first, don't assume the failure is a config problem to fix.
- **Status: OPEN as a documented lesson, not fully closed as a process** — no automated check prevents someone from repeating the Google CSE troubleshooting detour; this entry is that check until one exists.

### 9. The 53,000-row / 0.09%-yield enrichment incident (2026-07-03)
- **Symptom:** A bulk image-enrichment run against the 127k fragrance catalogue kept going for 53,000 rows before Christopher manually stopped it, having found real images for only ~47 rows.
- **Root cause:** URL-guessing enrichment (Parfumo/Fragrantica-style) against a long-tail catalogue converges to a near-zero hit rate once past the well-known/flagship fragrances — the tail (flanker/variant SKUs, niche brands) will never have bottle photography at a guessable URL. Nothing stopped the script from grinding through all 127k rows at that rate before this incident.
- **Evidence:**
  - `CLAUDE.md` §7: "Images at 127k: bulk URL-guess enrichment yields ~0.09% (53k-row run, 2026-07-03; miss log `scripts/data/image-misses.txt`, 249k entries)."
  - `docs/nota/04-architecture-plan.md:100`: "Reality check [V]: URL-guess enrichment against Parfumo/Fragrantica yields ~0.09% (47 hits / 53k rows, 2026-07-03)."
  - `docs/nota/07-engineering-handover.md:55`: confirms the same figure and states the fix — "the script now has a <1%-yield circuit breaker; `--force` overrides."
  - Fix verified live in code: `scripts/enrich-images.mjs` lines 31, 36-40, 247-256 — `YIELD_CHECK_MIN_ROWS = 1000`, `YIELD_CHECK_MIN_RATE = 0.01` (1%), a circuit breaker that halts after 1,000 rows if the hit rate is below 1%, requiring an explicit `--force` flag to continue past it, printing `🛑 Circuit breaker: hit rate is X% after N rows`.
- **Rejected approach going forward:** re-running bulk URL-guess scraping expecting a different result — the catalogue's tail structurally will not have bottle photography this way. The adopted strategy (per `docs/nota/07-engineering-handover.md:55`) is family-gradient default (`lib/familyGradients.ts`) + targeted top-N enrichment via the admin review queue, plus a separate, more accurate retailer-verified Shopify enrichment workstream (`scripts/enrich-images-shopify.mjs` — see the `shopify-image-enrichment` skill; coordinate rather than duplicate).
- **Status: CLOSED as a process** (circuit breaker live and verified in code) but the underlying image-coverage gap is **OPEN** — `CLAUDE.md` describes family gradients as the accepted permanent default, not a stopgap. Do not propose "just re-run the enrichment script harder/differently" without first reading `scripts/enrich-images.mjs`'s existing circuit breaker and the `shopify-image-enrichment` skill.

### 10. Gemini → Haiku migration + Vertex Imagen disable (billing)
- **Symptom:** Multiple LLM-backed routes were originally built on Google Gemini; later migrated to Claude Haiku. A separate image-generation route using Google Vertex AI Imagen was disabled outright.
- **Root cause:** Consolidating onto one LLM provider (Anthropic Haiku) for the routes that needed it, and stopping an active Google Cloud billing source (Vertex Imagen) that was no longer wanted.
- **Evidence:**
  - `5a90cc2` — "fix(api): sommelier — switch gap_analysis from Gemini to Claude Haiku"
  - `4289212` — "fix(api): dna-match — add chemist_cache lookup + switch to Claude Haiku"
  - `90ff17a` — "feat: plain-language descriptions via Claude Haiku" and `065d4a6` / `594c8c0` — "AI pros/cons ... via Claude Haiku + cache" show Haiku was the default choice for new LLM features by this point, not just a migration target for old ones.
  - `205b64c` — "fix(api): disable Vertex AI image generation route — stops Google billing" (2026-07-01) — the `/api/generate-image` route (Vertex AI Imagen) was disabled specifically to stop Google Cloud billing, per `CLAUDE.md`'s dossier note "DISABLED 2026-06-28" (**date discrepancy**: `CLAUDE.md`/dossier text says disabled 2026-06-28, but the actual commit `205b64c` is dated 2026-07-01 — trust the commit timestamp, `205b64c` at 2026-07-01 01:05:54+0100, over the prose date; verify with `git show -s --format=%ci 205b64c`).
  - `@google/genai` remains in `package.json` as a dependency (per `CLAUDE.md` §2, marked "legacy") — it was not fully removed, only routed around for active LLM calls.
- **Status: CLOSED for the routes migrated.** `/api/generate-image` stays disabled — do not silently re-enable it without confirming the Google billing concern has been separately resolved. If you need current LLM-route inventory, don't trust this list — re-check `app/api/` for which routes call `@anthropic-ai/sdk` vs `@google/genai` (`grep -rln "@google/genai\|@anthropic-ai/sdk" app/api`).

### 11. Incident 2 recurred silently — 11 more unconfigured image hosts already live (2026-07-05)
- **Symptom:** `/discover` crashed with the React ErrorBoundary ("Something went wrong") during a fresh e2e run — identical failure shape to Incident 2. Root query (`SELECT DISTINCT host FROM fragrances WHERE image_url IS NOT NULL`) found **12 hosts** not in `next.config.ts` `remotePatterns`, only one of which (`www.mannenzaak.nl`) was the one actually hit by the test: `parfumistas.com`, `dlagentlemana.pl`, `res.cloudinary.com`, `cdn.awsli.com.br`, `f.fcdn.app`, `img.fragrancex.com`, `media.falabella.com`, `newfragrance.com`, `piimages.parfumo.de`, `rimage.ripley.cl`, `store.womostore.com`, `www.mannenzaak.nl`.
- **Root cause — a real gap in Incident 2's fix:** the "add to `next.config.ts` in the same commit" rule assumes one script writing from one known retailer domain (true for `enrich-images-shopify.mjs`'s per-brand pattern). It does not hold for **generic reverse-image-search enrichment** (DuckDuckGo/Google-CSE-backed scripts like `enrich-images.mjs` / `fetch-fragrance-images.mjs`) — those can return a hit from *any* retailer site on the internet, so the set of hosts is unbounded and unknowable at commit time. No commit in `git log` added these 12 hosts to `next.config.ts`, and no script in `scripts/` references them by name (confirmed via `git log --all --grep` and `grep -rl` on the hostnames, 2026-07-05) — they arrived as enrichment-script output, silently, with no gate catching the mismatch until a page actually rendered that row.
- **Evidence:** fix commit adds all 12 hosts to `next.config.ts` `remotePatterns` + a new e2e regression test `e2e/discover.spec.ts` ("renders a Discover card from www.mannenzaak.nl") asserting a card from the previously-broken host actually renders. `QE-6` and `QE-7` in `.claude/skills/qe-automation/LESSONS.md` cover the two distinct process gaps found (missing periodic host audit; `networkidle` wait anti-pattern in the same spec file that was independently timing out before this was found).
- **Also fixed in the same pass:** `discover.spec.ts`'s three original tests waited on `page.waitForLoadState('networkidle')`, which is fragile against a 127k-row dev-server page with ongoing analytics/PostHog keep-alive requests — rewrote to wait on specific elements (`getByPlaceholder(...).toBeVisible()` etc.) instead. This was a **separate, pre-existing flake** surfaced by the same test run, not caused by the host bug.
- **Also found, NOT fixed (out of scope, spawned as its own task, `task_8c9fadcd`):** a distinct data-quality issue in the same query — some `image_url` values point to Fragrantica/Parfumo *perfume page* URLs (e.g. ending `.html`) instead of direct image files, causing upstream 403s and broken-image icons (not crashes). Do not conflate this with the remotePatterns bug; different symptom (broken icon vs full page crash), different fix (data cleanup vs config).
- **Status: CLOSED for the 12 hosts found this pass; OPEN as a structural risk.** Incident 2's rule ("add the host in the same commit") is necessary but not sufficient for search-based enrichment scripts. No automated recurring check exists yet — consider a periodic host-audit query (the one used to find this) as a scheduled task, or validating discovered hosts against the `next.config.ts` allowlist inside the enrichment script itself before writing `image_url`, queuing unknown hosts for review instead of writing them blind. Do not assume "the remotePatterns list is complete" without re-running the audit query — this incident proves it silently drifts.

---

## Reverts index (quick lookup)
Verified via `git log --oneline -i --grep=revert -50` plus manual cross-check of ProGate/debug-route fixes that read like reverts but aren't labelled as such in the message:

| Commit | Message | Covered in |
|---|---|---|
| `31e384f` | Revert "test: deliberate type error" (reverts `6957904`) | Incident 1 (part of the same build-failure streak, this one was a deliberate test commit reverted the same day) |
| `be1b59f` | revert: remove asset sovereignty and financial terminology | Incident 5 |
| `a0da222` | fix: remove unauthenticated debug/image-audit route breaking build (revert-like: deletion, not a labelled "Revert") | Incident 1, Incident 6 |
| `359670f` | fix: restore schedule page real content — ProGate was unconditional (revert-like: restoring prior behaviour) | Incident 7 |

---

## Provenance and maintenance

**Source files this skill was derived from:**
- `AGENTS.md` (repo root) §9 Lessons L1-L17, especially L15/L16/L17; §"Known fabrications" (~line 124)
- `CLAUDE.md` (repo root) §1 (rebrand debt, fragrance count), §5 (DB facts), §7 (LLM/cost posture, image yield)
- `.claude/skills/grounded-agent-guardrails/SKILL.md` — "Known Fabrications — Never Reintroduce" section
- `.claude/skills/branch-hygiene/SKILL.md` — Step 4 build-gate commentary (cross-references the same 2026-06-25 incident)
- `docs/PRODUCT_TRUTH.md` (cited as the stale artifact itself, lines 13, 64, 69)
- `docs/nota/04-architecture-plan.md:100`, `docs/nota/07-engineering-handover.md:55` (53k-row enrichment incident)
- `scripts/enrich-images.mjs`, `scripts/enrich-images-google.mjs`, `scripts/fetch-fragrance-images.mjs` (code-level verification of Incidents 8 and 9)
- `git log --oneline -200` and `git show --stat <hash>` for every commit hash cited above, run against `/Users/christophergoslin/Projects/scentral-hub` on 2026-07-05

**Re-verification commands (run these if anything here feels stale):**
```bash
# Confirm every commit hash still resolves to the message quoted above
git -C /Users/christophergoslin/Projects/scentral-hub show -s --format="%h %ci %s" \
  be1b59f 359670f 8569de2 a0da222 f4dfd79 6957904 31e384f 2ba9b99 \
  9384361 75d8977 196f431 205b64c 5a90cc2 4289212 907bf87

# Confirm the pre-push hook still checks both conditions from Incident 1
cat /Users/christophergoslin/Projects/scentral-hub/.husky/pre-push

# Confirm the yield circuit-breaker from Incident 9 is still in the script
grep -n "YIELD_CHECK_MIN_RATE\|YIELD_CHECK_MIN_ROWS\|force" \
  /Users/christophergoslin/Projects/scentral-hub/scripts/enrich-images.mjs

# Confirm current live fragrance count instead of trusting 127,595/127,195 above
# (via Supabase MCP execute_sql, project scentral-mvp / lrkdwobnemczvhpixpky)
# SELECT count(*) FROM fragrances;

# Confirm next.config.ts still whitelists the hosts from Incident 2
grep -n "remotePatterns" -A 30 /Users/christophergoslin/Projects/scentral-hub/next.config.ts

# Re-check for any newer revert not yet chronicled here
git -C /Users/christophergoslin/Projects/scentral-hub log --oneline -i --grep=revert -50
```

**Maintenance rule:** when a new investigation, dead end, rejected fix, or revert happens, add a new numbered incident here in the same symptom → root cause → evidence → status format — do not just fix the bug and move on. This file is only useful if it stays current; an out-of-date archaeology skill is worse than none, because it gives false confidence that a battle is settled when it isn't.
