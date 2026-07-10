---
name: nota-research-frontier
description: Use when asked "what could nota. genuinely advance / research / be first at", when scoping an R&D spike or a paper/blog-worthy result, or when someone proposes a "cool AI feature" and you need to check whether it is actually a novel problem nota. is positioned to solve versus a commodity feature. Applies only to the nota. repo (scentral-hub). Lists open research problems, why current approaches (including nota.'s own current heuristics) fall short, nota.'s specific data/asset advantage, and the first three concrete repo steps for each. Everything here is labeled open/candidate — nothing is a validated result. Do NOT use this for routine feature work (see feature-dev), for deciding whether a hunch is true (see research-methodology — this skill picks the question, that skill runs the experiment), for the identity/shelf data-model cleanup itself (use `nota-identity-consolidation-campaign`, the sibling execution-plan skill — now exists, see Fenced paths below), or for security findings (see security-hardening).
---

# nota. research frontier

Plain-language framing: this is not a list of features to build. It is a list of **questions nota. is uniquely positioned to answer**, because of data or product mechanics competitors don't have. Every item below is unproven. Treat each "you have a result when…" line as the actual finish line — nothing before that is a result, it's a hypothesis.

Before running any experiment from this list, load `research-methodology` (global skill) for the evidence bar: pre-registered hypothesis, control/comparison, minimum sample size, and what counts as "confirmed" versus "suggestive." This skill only tells you which questions are worth that treatment.

## Fenced paths — read this before citing anything below

- **CORRECTED 2026-07-10: `nota-identity-consolidation-campaign` now exists** (296-line, 8-phase executable campaign skill — added after this skill was first authored). `.claude/skills/` now contains (re-verified this session: `find .claude/skills -maxdepth 2 -iname "*.md"`): `branch-hygiene`, `diagnose-prod-slowdown`, `fragrance-domain-reference`, `grounded-agent-guardrails`, `nota-architecture-contract`, `nota-config-and-flags`, `nota-failure-archaeology`, `nota-identity-consolidation-campaign`, `nota-run-and-operate`, `qe-automation`, `repo-tidy`, `resilience-abuse`, `safe-commit-shared-repo`, `security-hardening`, `shopify-image-enrichment`, `testing-framework`, `verify-cli-claims`. The identity/shelf consolidation work is real and is a hard prerequisite for items 1 and 2 below (see "Why current SOTA fails" in each) — use `nota-identity-consolidation-campaign` directly for its numbered phases, gates, and rollback logic instead of the prose in `CLAUDE.md` §3, §5, §6.
- The skill list above was written concurrently with several sibling skills in the same authoring pass (file timestamps within the same minute) — re-verify with `find .claude/skills -maxdepth 2 -iname "*.md"` before citing a skill path, since more may have been added since.
- Everything below was checked against the live repo on 2026-07-05. Schema facts came from `supabase/migrations/*.sql` and route code, not from memory — re-run the grep given in each section before relying on a column name.

## The consolidation dependency (read first)

Items 1 and 2 both need clean, user-level (not `anon_id`-fragmented) historical data to mean anything statistically. As of 2026-07-05:

- `evolution_events` and `noseprint_history` are keyed on `anon_id text`, not `user_id` (verified: `supabase/migrations/20260703_noseprint_evolution.sql:8,31`; `user_id` was added to `evolution_events` later as a nullable column for transition in `supabase/migrations/20260704_db006_identity_model_migration.sql:12`, but the write path in `app/api/evolution/detect/route.ts:22,37` still reads/writes `anon_id` exclusively — it never touches `user_id`).
- `blind_ranking_sessions` / `blind_ranking_choices` (used by `app/api/blind-ranking/{session,place,reveal}/route.ts`) are on the newer `user_id` model and require `auth.getUser()` (verified: `app/api/blind-ranking/place/route.ts:16-17`).
- `collections.affinity_score` (sighted ranking signal, default 50) is on the legacy `anon_id` model in some call sites and mixed in others (verified: `grep -rln affinity_score app lib supabase` returns both `app/api/evolution/detect/route.ts` (anon_id) and `app/(main)/collection/[id]/AffinityRater.tsx` (check at read time which identity the component uses)).

Net effect: any cross-referencing of blind-ranking choices against collections affinity today will silently mix signed-in and signed-out users unless you filter carefully. Do not report a headline number until you've verified, per query, which identity column each source table actually used at write time.

---

## 1. Noseprint evolution science — can identity drift be detected or predicted?

**The question:** nota. captures a "Noseprint" (identity artefact) and re-evaluates it over time (`evolution_events`, `noseprint_history`). Is a detected shift real signal, or noise from a small, unrepresentative event window? Could a future shift be predicted before it happens, not just detected after?

**Why current SOTA (nota.'s own shipped code) fails:**
The only detection logic that exists today is `app/api/evolution/detect/route.ts`, and it is a placeholder heuristic, not a model:
- `familyShift` is hardcoded to `0.25` whenever the user has any top family at all (`app/api/evolution/detect/route.ts:103`: `const familyShift = topFamilies.length > 0 ? 0.25 : 0 // Simplified heuristic`) — it does not compare old vs. new family distributions at all.
- Descriptor detection is a fixed 9-word keyword list matched against free-text `scent_memory` (`app/api/evolution/detect/route.ts:85`), not an embedding or LLM read.
- The persona re-mapping (`mapAnalysisToPersona`, lines 121–141) is a hand-written if/else chain over family name, not fit to any data.
- The minimum sample is 10 `collections` rows in a 30-day window (line 48) — arbitrary, never validated against false-positive rate.
- It reads `collections` (legacy `anon_id` table), so it never sees `shelf_items` activity on the new `user_id` model — meaning post-migration user behavior is invisible to it today.

**nota.'s specific asset:** the *combination* of `evolution_events` (labeled shift attempts with a real user response: `user_choice` ∈ stay/evolve/keep_both) and `interactions` (general event log, `user_id, event_type, entity_type, entity_id, metadata` — verified schema from insert call sites `app/api/shelf/route.ts:77` and `app/read/ReadClient.tsx:92`) gives a rare thing: a labeled dataset where the user explicitly confirmed or rejected a detected identity shift. Most "preference drift" research has no ground truth; nota. has one by construction, once enough `user_choice` values are non-null.

**First three concrete steps in this repo:**
1. Count usable ground truth: `select count(*) from evolution_events where user_choice is not null;` via Supabase MCP `execute_sql`, or `grep -n "user_choice" app/api/evolution/detect/route.ts` to confirm no UI currently writes `user_choice` at all (verify this first — if it's always null, there is no ground truth yet and this whole item is blocked, not just weak).
2. If populated: pull `evolution_events` joined to the `interactions` rows in the preceding 30 days for the same identity (user_id where present, else anon_id), and compare interaction-volume/diversity between `user_choice='evolve'` cases and `user_choice='stay'` cases — this is the first real (non-hardcoded) signal test.
3. Replace the `0.25` constant with an actual distributional comparison (e.g., cosine distance between two family-frequency vectors, old window vs. new window) behind a feature flag, and run it in shadow mode (write to a new column, don't surface to users) before touching `mapAnalysisToPersona`.

**You have a result when:** you can show, on held-out users, that the real distributional-shift score predicts `user_choice='evolve'` better than the current hardcoded heuristic (a coin flip, effectively, since `familyShift` is constant) — at a sample size research-methodology's evidence bar accepts as more than noise. Until then this is a data-collection gap, not a validated finding.

**Status: open / blocked on ground-truth volume.** Re-check: `select user_choice, count(*) from evolution_events group by user_choice;`

---

## 2. Blind-ranking bias removal — does it actually remove bias?

**The question:** nota.'s Blind Ranking flow (`/shelf/blind`) asks users to rank fragrances by scent profile alone — family, notes, accords — with brand/name/image withheld (verified: `BLIND_COLUMNS = 'id, family, top_notes, heart_notes, base_notes, dominant_accords'`, `app/api/blind-ranking/session/route.ts:15`, comment at line 6-7 confirms identity fields are excluded from the `select()`, not just hidden client-side). The premise is that this produces a truer preference signal than "sighted" ranking, which is contaminated by brand prestige and packaging. Nobody has checked whether blind ranks actually diverge from sighted signals, or whether users just reconstruct the brand from the notes anyway (a Lattafa oud blend smells identifiable) and rank identically.

**Why current SOTA fails:** there is no current SOTA — this comparison has never been run. The blind-ranking feature (added per `git log`: commit `e378c9f feat(blind-ranking): add /shelf/blind bias-removal flow, session/choice tracking, shelf commit on reveal`) ships the mechanism but the repo has zero code that reads `blind_ranking_choices` back out for cross-user or cross-signal analysis — every read site is transactional plumbing for that same session's own flow: the three API routes (`session`/`place`/`reveal`), the session display page and its OG-image renderer (`app/shelf/blind/[sessionId]/{page.tsx,opengraph-image.tsx}`, both just render one session's own choices back to its own user), and a GDPR deletion script (`scripts/dsar-delete-user.mjs`, which deletes the rows, it doesn't analyze them). None of these compute a cross-user statistic or compare blind rank to sighted affinity (verified: `grep -rln "blind_ranking_choices" app lib scripts`, then read each hit).

**nota.'s specific asset:** the same user has both a blind rank (`blind_ranking_choices.placed_rank`, 1–10, `RANKS_TOTAL` in `app/api/blind-ranking/place/route.ts:10`) and a sighted signal (`collections.affinity_score`, default 50, rated via `AffinityRater.tsx`) for overlapping fragrances. Almost no fragrance product has both a blind and sighted preference signal for the same person on the same items — that pairing is the whole experiment.

**First three concrete steps in this repo:**
1. Confirm you have any users with both signals populated for the same fragrance: `select brc.fragrance_id, brc.placed_rank, c.affinity_score from blind_ranking_choices brc join collections c on c.fragrance_id = brc.fragrance_id` (join key must match identity model — check whether `blind_ranking_choices` carries `user_id` or needs a join through `blind_ranking_sessions.user_id`, and whether the matching `collections` row is keyed `user_id` or `anon_id` for that same person — this is the consolidation dependency from the top of this file, concretely instantiated).
2. If the join produces rows: compute rank correlation (Spearman) between blind placement and sighted affinity per user, not pooled — bias removal is a within-user effect, pooling across users would wash it out.
3. Read `app/(main)/collection/[id]/AffinityRater.tsx` to confirm exactly what UI signal produces `affinity_score` (star rating? slider?) before treating it as comparable to a 1–10 forced rank — a 1-20 scale rating and a forced unique-rank ordering are not the same measurement type, and the comparison needs a documented conversion, not an eyeballed one.

**You have a result when:** you can show a statistically meaningful within-user divergence (or convergence) between blind rank and sighted affinity across a real sample — with the sample-size and pre-registration bar from `research-methodology`. A single anecdote ("user X ranked differently blind") is not a result.

**Status: open / no cross-user or cross-signal analysis code exists yet.** Re-check: `grep -rln "blind_ranking_choices" app lib scripts` and read each hit — as of 2026-07-05 every one is transactional (own-session read/write) or a deletion script, not an analytics query.

---

## 3. 127k-catalogue enrichment coverage as a moat

**The question:** is nota.'s bulk-imported 127,595-row catalogue (verified: `CLAUDE.md` §5, and `fragrances` table columns `plain_description, inspired_by, family, projection, optimal_season, use_case, lean, image_url, popularity_rank`) actually a defensible advantage, or is it 127k rows of mostly-empty fields that looks big and helps nobody? This is measurable today, not speculative.

**Why current SOTA fails:** competitors either have far smaller hand-curated catalogues (accurate but tiny) or none of nota.'s structured fields (raw scraped names only). nota.'s risk is the opposite failure mode: breadth without depth. Known gap, already quantified for one field: image enrichment across the whole catalogue runs at approximately **0.09% hit rate** on a 53,000-row batch run (`CLAUDE.md` §7, the 2026-07-03 incident; miss log at `scripts/data/image-misses.txt`, ~249k entries — more misses than rows, meaning the same fragrances were retried across multiple failed scripts). No one has run the equivalent coverage measurement for `plain_description`, `inspired_by`, or `image_url` catalogue-wide as a single report.

**nota.'s specific asset:** `scripts/rank-image-gaps.mjs` already exists and is read-only — it ranks NULL-`image_url` rows by real user-facing surface area (discovery box membership, `collections` count, `wear_logs` count, rating, `spritz_count` — see weights documented in the script's own header comment, `scripts/rank-image-gaps.mjs:15-23`) rather than raw row count. That prioritization logic — "fix coverage where users actually look, not the catalogue tail" — is the reusable asset; it doesn't yet exist for `plain_description` or `inspired_by`.

**First three concrete steps in this repo:**
1. Run the existing tool to get current image-coverage-by-priority: `node scripts/rank-image-gaps.mjs --top=200` (read-only, writes only to `scripts/data/image-priority.csv` and stdout — safe to run repeatedly).
2. Get a flat coverage percentage per field, catalogue-wide, via Supabase MCP `execute_sql`: `select count(*) filter (where plain_description is not null) * 100.0 / count(*) as pct_description, count(*) filter (where image_url is not null) * 100.0 / count(*) as pct_image, count(*) filter (where inspired_by is not null) * 100.0 / count(*) as pct_inspired from fragrances;` — this single query is the moat-or-not headline number and does not exist anywhere in the repo today.
3. Read `scripts/enrich-fragrances.mjs` (verified: queries `fragrances WHERE plain_description IS NULL LIMIT 100`, `scripts/enrich-fragrances.mjs:4`) to see the existing per-field enrichment pattern, then decide whether a `rank-description-gaps.mjs` sibling to `rank-image-gaps.mjs` is worth building — do not run any enrichment script past 1,000 rows without the yield circuit-breaker discipline in `ai-orchestration-playbook` (the 53k-row/0.09% incident is exactly this failure mode repeating).

**You have a result when:** you can state, with a real query result in hand, "X% of the catalogue has field Y populated, weighted coverage on user-visible rows is Z%" for each of `plain_description`, `image_url`, `inspired_by` — and can say whether that weighted number (not the raw 127,595) beats a named competitor's claimed catalogue size. Right now nobody has run step 2. This is the cheapest item on this list to convert from "candidate" to "measured fact" — it's one SQL query.

**Status: candidate — directly measurable today, not yet measured.**

---

## 4. Clone-confidence calibration — do Haiku's scores match user agreement?

**The question:** `/api/clone-confidence` asks Claude Haiku to score how closely a "clone" fragrance matches its "inspired by" original, returning a 1–10 score, a verdict string, and a buy recommendation (verified: `app/api/clone-confidence/route.ts:31`, model `claude-haiku-4-5-20251001`, cached in `chemist_cache`). Is that score calibrated to what users actually agree with, or is it an LLM confidently asserting a number nobody has checked?

**Why current SOTA fails:** the route has no feedback loop at all. It calls Haiku, caches the JSON result keyed by a string (`clone_confidence_${cloneName}_${inspirationName}`, line 16), and returns it. `chemist_cache`'s schema is `id, fragrance_a_id, fragrance_b_id, result jsonb, created_at` — no column for user agreement (verified: `supabase/migrations/20260611_chemist_cache.sql:4-9`). There is no reaction capture, no "was this right?" prompt anywhere in the route. The general reaction primitive nota. has for other content (`trace_reactions`, with types `felt|noted|saved` — verified `supabase/migrations/20260703_trace_reactions_table.sql:6`) is not wired to clone-confidence results at all.

**nota.'s specific asset:** `interactions` is a generic event log (`user_id, event_type, entity_type, entity_id, metadata jsonb`) already used elsewhere (`app/api/shelf/route.ts:77`, `app/read/ReadClient.tsx:92`) — it is schema-ready to capture a "did you agree with this clone score" signal today without a migration, by inserting `event_type: 'clone_confidence_reaction'` with the score and user's agreement in `metadata`. No new table is needed to start collecting ground truth.

**First three concrete steps in this repo:**
1. Read `app/api/clone-confidence/route.ts` fully (55 lines) to confirm there is genuinely no reaction capture today — this is a small file, verify before building anything.
2. Find the client component that calls this route (`grep -rln "clone-confidence" app --include="*.tsx"`) and check whether a thumbs-up/down or agree/disagree UI already exists anywhere nearby that could be repointed, versus needing new UI.
3. Propose (do not ship without sign-off, per this repo's change-control norms) a minimal addition: after showing the Haiku verdict, capture a binary agree/disagree into `interactions` with `entity_type: 'clone_confidence'`, `entity_id` = the cache key or clone fragrance id, `metadata: { score, verdict, agreed: boolean }`.

**You have a result when:** you have enough `interactions` rows of this type to compute agreement rate binned by Haiku's own score (does a "9/10" verdict get agreed with more often than a "5/10"?) — if agreement is flat across score bins, the score is decorative, not calibrated. That comparison is the falsifiable claim.

**Status: open / instrumentation does not exist yet — this is a build-then-measure item, not a query-the-data item.**

---

## 5. Affiliate conversion science

**The question:** once AWIN merchant approval lands, does nota.'s "soft commerce" framing (Temptations, blind-buy stamps, Shelf-driven links) convert better than a generic search-and-click affiliate model? This is entirely gated on an external approval nota. does not control.

**Why current SOTA fails:** there is no current data because there is no live commission path yet. `lib/affiliates.ts` confirms AWIN publisher ID 2955445 was approved 2026-06-28, but all three merchant IDs (Notino, Douglas, FeelUnique) are literally the string `'PENDING'` (verified: `lib/affiliates.ts`, `AWIN_MID_NOTINO = 'PENDING'` etc., header comment lines 1-15 spell out the exact activation steps). Every affiliate link today falls back to a plain search URL with zero commission, by the code's own `isActive` flag design.

**nota.'s specific asset:** the "Temptations" mechanism (soft commerce triggers — table `temptations`, `reason`/`status` shown/resolved) plus per-fragrance Shelf placement gives nota. a contextual trigger point that a plain retailer link doesn't have. But this is a hypothesis about UX framing, not yet an asset with data behind it.

**First three concrete steps in this repo:**
1. UNVERIFIED — check with: log into the AWIN dashboard (outside this repo) to see if Notino/Douglas/FeelUnique merchant applications have moved off PENDING; this cannot be checked from the repo.
2. If approved: `grep -n "AWIN_MID_" lib/affiliates.ts` to find exactly where to replace the placeholder strings, and confirm `NEXT_PUBLIC_AWIN_PUBLISHER_ID` is set in Vercel (not just `.env.example`) before any link goes live — this is a production config change, flag it per this repo's own deploy discipline, don't just edit and push.
3. Once live, instrument click-through separately by trigger surface (Temptations vs. Shelf vs. plain catalogue link) using `trackEvent` (`lib/analytics.ts`) with a `surface` property, so conversion can be compared by context, not just aggregated — today no affiliate link click fires any PostHog event at all (verify: `grep -rln "trackEvent" lib/affiliates.ts app` — check whether any call site wraps the affiliate URL builder).

**You have a result when:** you have live commission or click-through data (from AWIN's own reporting or from an instrumented click event) comparing at least two trigger surfaces, over a large enough sample per `research-methodology`'s bar, and can say one surface converts differently than another. Before merchant approval, this entire item is inert — don't spend engineering time on step 3 until step 1 is confirmed unblocked.

**Status: open / hard-blocked on an external approval not tracked in this repo.**

---

## 6. Cognitive-load UX bar as a measurable product differentiator

**The question:** Christopher's quality bar (see `ux-interaction-standard` skill, global) is "minimal cognitive load, apple/stripe-grade seamlessness." Can this be turned from a subjective design opinion into a measured funnel — e.g., do users complete The Read, place a Shelf item, or finish a Blind Ranking session at a rate that reflects low friction, and does that rate move when the UI changes?

**Why current SOTA fails:** there is currently no funnel instrumentation on any of nota.'s core-loop surfaces to even ask this question. Verified facts, not assumptions:
- PostHog is initialized with `autocapture: false` and `capture_pageview: false` (`lib/analytics.ts:14-15`) — a deliberate privacy choice, but it means nothing is captured unless a component explicitly calls `trackEvent`.
- `grep -rln "trackEvent" "app/(main)/shelf" app/read "app/(community)"` returns **no results** — none of The Read, Shelf, or Traces/community surfaces call `trackEvent` anywhere, as of 2026-07-05.
- `trackEvent` itself is called elsewhere in the app (`grep -rln posthog lib app` shows ~19 files including `app/(main)/collection`, `app/(main)/discover`, `app/(main)/spritz`, `app/onboarding`), so the pattern exists and works — it's just absent from the three surfaces this question is actually about.

**nota.'s specific asset:** the product's core loop (Read → Noseprint → Shelf → Blind Ranking → Traces) is a small, well-defined set of screens, not a sprawling app — a funnel here is cheap to define precisely, and nota. already has the `trackEvent`/PostHog wiring pattern proven out on other surfaces to copy.

**First three concrete steps in this repo:**
1. Read `lib/analytics.ts` in full (it is 41 lines) and one existing call site, e.g. `grep -n "trackEvent" app/(main)/discover/DiscoverClient.tsx`, to copy the exact calling convention (event name casing, property shape, PII stripping already built in for `email`/`search_query`).
2. Define the funnel steps as literal PostHog event names before writing any code — e.g. `read_started` → `read_identity_revealed` → `shelf_item_added` → `blind_ranking_session_started` → `blind_ranking_revealed` — and check none of these event name strings already exist under a different spelling: `grep -rhn "trackEvent(" app --include="*.tsx" -A0 | grep -oE "trackEvent\('[a-z_]+'" | sort -u` (run this first so you don't fragment the same funnel step under two names).
3. Add `trackEvent` calls at each step in `app/read/ReadClient.tsx`, `app/(main)/shelf/page.tsx` (or its client component), and the blind-ranking flow client — matching the existing PII-safe pattern, not inventing a new one. This is a small, additive, low-risk change but touches user-facing surfaces — follow this repo's own UX/testing discipline (`ux-interaction-standard`, `qe-automation`) and run `npm run test:e2e` after, since e2e specs are known to be sensitive to surface changes (`CLAUDE.md` §11 rule 4).

**You have a result when:** you have a real funnel completion rate (e.g., "N% of Read starts reach a placed Shelf item") from live PostHog data, a baseline is recorded, and a subsequent UX change shows a measured delta against that baseline — with the sample size and comparison rigor `research-methodology` requires. A screenshot of a redesigned screen is not a result; a funnel number that moved is.

**Status: open / instrumentation gap confirmed, zero baseline data exists today.**

---

## Cross-references

- **research-methodology** (global skill): the evidence bar for every "you have a result when" line above — load it before designing any of these as an actual experiment, not just this skill.
- **ai-orchestration-playbook** (global skill): the yield circuit-breaker discipline for any enrichment/backfill script touched by item 3 — the 53k-row/0.09% incident is the cautionary precedent, already codified there.
- **nota-identity-consolidation-campaign**: now exists (see Fenced paths, top of this file). It is the real prerequisite for items 1 and 2 — load it directly for the execution phases, gates, and rollback logic.
- **nota-architecture-contract**: load before touching identity (`anon_id`/`user_id`) or the Shelf data model — it states the load-bearing design contract items 1 and 2 depend on being stable before you measure anything against it.
- **nota-config-and-flags**: for the AWIN/Shopify/feature-flag env var inventory behind item 5 — load it before touching `lib/affiliates.ts` or any `NEXT_PUBLIC_*` var.
- **fragrance-domain-reference**: for the vocabulary used above (Noseprint, Blind Ranking, Temptations, Traces) if any term is unclear.
- **shopify-image-enrichment**: covers the practical mechanics of running image-enrichment scripts (item 3) safely against a real storefront — read it before running any enrichment script, not just `rank-image-gaps.mjs`.

## Provenance and maintenance

Derived from, 2026-07-05:
- `supabase/migrations/20260703_noseprint_evolution.sql`, `20260704_db006_identity_model_migration.sql`, `20260703_trace_reactions_table.sql`, `20260703_description_enrichment.sql`
- `app/api/evolution/detect/route.ts`, `app/api/blind-ranking/{session,place,reveal}/route.ts`, `app/api/clone-confidence/route.ts`, `app/api/shelf/route.ts`, `app/read/ReadClient.tsx`, `supabase/migrations/20260611_chemist_cache.sql`
- `lib/affiliates.ts`, `lib/analytics.ts`, `scripts/rank-image-gaps.mjs`, `scripts/enrich-fragrances.mjs`
- Repo `CLAUDE.md` §3, §5, §6, §7, §11 (identity model, schema, image posture, operational rules)
- `git log --oneline -- app/api/evolution app/api/blind-ranking` (blind-ranking commit `e378c9f`)

Re-verification commands (run these before trusting any fact above — this file will drift):
- Skill inventory: `find .claude/skills -maxdepth 2 -iname "*.md" | sort`
- Evolution heuristic still hardcoded: `grep -n "Simplified heuristic" app/api/evolution/detect/route.ts`
- Evolution ground truth volume: `select user_choice, count(*) from evolution_events group by user_choice;` (Supabase MCP `execute_sql` or dashboard)
- Blind-ranking analysis code still absent: `grep -rln "blind_ranking_choices" app lib scripts` (expect only transactional session routes/pages + `scripts/dsar-delete-user.mjs`, no analytics query)
- Catalogue field coverage: `select count(*) filter (where plain_description is not null)*100.0/count(*) as pct_desc, count(*) filter (where image_url is not null)*100.0/count(*) as pct_image from fragrances;`
- Clone-confidence reaction capture still absent: `grep -n "interactions" app/api/clone-confidence/route.ts`
- AWIN merchant IDs still pending: `grep -n "AWIN_MID_" lib/affiliates.ts`
- Funnel instrumentation still absent: `grep -rln "trackEvent" "app/(main)/shelf" app/read "app/(community)"`
