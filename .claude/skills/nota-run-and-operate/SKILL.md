---
name: nota-run-and-operate
description: "Use when running, building, testing, or deploying nota. (repo scentral-hub) — commands for dev/build/lint/sanity-check/smoke test (local + prod)/e2e; the bin/deploy pipeline and what each gate failure means; installing the pre-push hook; and running an enrichment/backfill script safely (scripts/ dir, yield circuit-breaker). Trigger phrases: 'run nota locally', 'deploy nota to prod', 'the pre-push hook isn't blocking', 'run the smoke tests', 'run enrich-images', 'backfill images/notes/inspired_by', 'where do I see the deploy/analytics/error output'. Scope: scentral-hub only. Do NOT use for diagnosing a slow/timing-out prod route — use diagnose-prod-slowdown instead. Do NOT use for commit/branch/merge hygiene or duplicate-feature checks — use branch-hygiene instead. This skill covers running/operating the app and its scripts, not architecture or domain knowledge (see fragrance-domain-reference) or incident history (see nota-failure-archaeology)."
---

# nota. — Run and Operate

Plain-language summary: this is the "how do I actually run this thing" skill — starting the app, checking it isn't broken, shipping it to production safely, and running the batch scripts that fill in missing data (images, descriptions) without wasting money on a script that silently fails 99% of the time.

All commands below assume `cd ~/Projects/scentral-hub` (repo path verified: `/Users/christophergoslin/Projects/scentral-hub`).

## 1. Command anatomy

Verified against `package.json` (2026-07-05):

| Command | What it does | When to use |
|---|---|---|
| `npm run dev` | `next dev` — local dev server | Day-to-day development |
| `npm run build` | `next build` — production build | Before every push to main (required by pre-push hook); required gate in `bin/deploy` |
| `npm run lint` | `eslint` | Before committing; CI Stage 1 runs this |
| `npm run sanity-check` | `node scripts/sanity-check.mjs` | Checks required env vars present + scans for Next.js 16 architectural violations (module-level Supabase clients, etc.) |
| `npm run test:smoke` | `node scripts/smoke-test.mjs` against local server | Local pre-flight before deploying |
| `npm run test:smoke:prod` | Same script, `BASE_URL=https://scentral-hub.vercel.app` | Post-deploy health check (baked into `bin/deploy` step 5); also the mandated first step of any session per AGENTS.md session-start checklist |
| `npm run test:e2e` | `playwright test` (chromium, webkit, Mobile Chrome, Mobile Safari) | Full regression, especially after copy changes (text-selector breakage — see Incident 3 in nota-failure-archaeology) |
| `npm run test:e2e:headed` | Same, with browser UI visible | Debugging a failing e2e spec |
| `npm run audit` | `npm audit --audit-level=high` | Dependency vulnerability check |

`scripts/sanity-check.mjs` currently checks for `GEMINI_API_KEY` as a required var (line ~24) — this is a legacy holdover from the Gemini-era stack; most LLM routes have since moved to Claude Haiku (see `docs/nota/`). If `sanity-check` fails only on `GEMINI_API_KEY` and you don't have one, that's a known stale check, not a real blocker — verify with the team before treating it as load-bearing.

Smoke test route list (`scripts/smoke-test.mjs`, verify with `grep -n "ROUTES = \[" -A 20 scripts/smoke-test.mjs`): hits `/`, `/discover`, `/collection`, `/layering`, `/you`, `/onboarding`, `/spritz`, `/privacy`, `/terms`, `/intelligence`, `/dna-match`, plus API routes including two SQL-injection-attempt checks that must still return 200 (sanitization check) and two routes that must return 405 on GET (`/api/waitlist`, `/api/wear`).

## 2. Deploying — `bin/deploy` walkthrough

**The rule (binding, from AGENTS.md §7):** GitHub auto-deploy is not reliable — the Vercel webhook on `scentral-hub` has a history of going silent. **Never assume `git push` deployed anything.** Always deploy explicitly:

```bash
cd ~/Projects/scentral-hub && bin/deploy
```

This is not a style preference — it is the documented fix for a real incident class. If you skip `bin/deploy` and just push, you may believe you've shipped when you haven't. If in doubt, verify with `vercel ls` or the Vercel dashboard before telling anyone a deploy happened. UNVERIFIED-in-prod: whether the webhook is still broken today — re-check with `vercel git status` or by comparing a recent commit SHA against the live deployment's SHA in the Vercel dashboard.

`bin/deploy` gates, in order (verified by reading the script, `/Users/christophergoslin/Projects/scentral-hub/bin/deploy`):

| Step | Gate | Failure means |
|---|---|---|
| 1 | Current branch must be `main` | You're deploying from a feature branch — the script exits with instructions to `git checkout main` |
| 2 | `git status --porcelain` must be empty | Uncommitted changes exist — commit or stash first. The script will not deploy dirty state |
| 3 | `npm run build` must succeed | A real build error exists — same class of bug that caused 19+ consecutive failed builds on 2026-06-25 (missing dependency, module-level `createClient()`, type error). Fix locally; do not deploy to "see if it works" |
| 4 | `npx vercel deploy --prod`, then poll `vercel inspect <url> --json` every 5s for up to 300s until `state == READY` | If the command itself fails, Vercel rejected the deploy (check its stderr). If it never reaches READY within 5 minutes, or reaches `ERROR`/`CANCELED`, the deploy is stuck or broken — check the Vercel dashboard build logs directly |
| 5 | `npm run test:smoke:prod` | **This is the loud alarm case**: deployment succeeded (site is live) but the smoke test failed — meaning something is actively broken in production right now. Do not walk away; investigate immediately. This is a different failure class from steps 1–4 (those block *before* going live; this one fires *after*) |

If any step fails, the script exits non-zero with the error printed — there is no partial/silent deploy state to worry about except the step-5 case above.

## 3. Pre-push hook

**Purpose:** catches three bug classes locally, before push, in ~15-20s (vs. ~60s for a full build) — cheap insurance against another 19-build failure streak.

**Install (verified, `.husky/pre-push` + AGENTS.md "Local Dev Setup"):**
```bash
git config core.hooksPath .husky
cp scripts/hooks/pre-push .husky/pre-push && chmod +x .husky/pre-push
```
Both commands are required on every fresh clone. `core.hooksPath` and the hook file are both local, uncommitted, working-tree state — a hook placed at `.git/hooks/` will **silently never run** if `core.hooksPath` points elsewhere (this bit the team once; see AGENTS.md line ~28). Verify install with:
```bash
git config --get core.hooksPath   # must print .husky
ls -la .husky/pre-push             # must exist and be executable
```

**The three checks** (only run when pushing to `main` — the hook no-ops on other branches, verified `.husky/pre-push` line ~13):

1. `tsc --noEmit` — type-check. Failure = a real type error; fix it, don't bypass.
2. Grep for column-0 (module-level) `const X = createClient(...)` in `app/api/**/*.ts`. Failure = a Supabase client instantiated at module scope, which throws at **build time** if env vars are missing — move the `createClient()` call inside the route handler function instead.
3. Image hostname whitelist: any script declaring `// @image-domains: host1 host2` (top-of-file comment) must have those hostnames present in `next.config.ts` `remotePatterns`. Failure = a script is writing `image_url` values from a CDN that `next/image` will refuse to render, crashing the page **at render time** (not build time — silent to `tsc`/build, so this check exists specifically to catch what the other two can't). This is the direct fix for the 2026-06-28 Wikidata-backfill incident (see nota-failure-archaeology).

If the hook blocks a push and you believe it's wrong, do not bypass with `--no-verify` — fix the underlying issue or get sign-off first (per global CLAUDE.md guardrails).

## 4. Enrichment / backfill scripts (`scripts/` dir)

**Critical constraint (AGENTS.md §8, verified):** the Cowork/sandbox bash environment has **no outbound network**. Any script hitting Supabase, Parfumo, Fragrantica, Vercel, or any external API will fail with `EAI_AGAIN`/`ECONNREFUSED` if run from this agent's bash. **Never run these scripts from agent bash** — hand Christopher the exact command to run locally instead:
```bash
cd ~/Projects/scentral-hub
node scripts/<script-name>.mjs [--dry-run] [--limit=N]
```

**Inventory of real scripts** (verified `ls scripts/`, 2026-07-05 — do not assume a script exists without checking this list first):

| Script | Purpose |
|---|---|
| `enrich-images.mjs` | Bulk image URL backfill by slug-matching (see yield circuit-breaker below) |
| `enrich-images-google.mjs`, `enrich-images-shopify.mjs`, `enrich-images-wikidata.mjs` | Alternate image sources — Shopify one has its own skill, see below |
| `enrich-fragrances.mjs`, `enrich-notes.mjs` | Metadata/notes enrichment |
| `backfill-inspired-by.mjs`, `backfill-resonance.mjs` | Column backfills |
| `phase1-plain-descriptions.mjs`, `phase2-backfill-inspired-by-v2.mjs` | Named enrichment phases (check git log/commit messages for what phase means before assuming currency) |
| `fetch-fragrance-images.mjs` | Has a DuckDuckGo fallback already built in — Google CSE closed to new projects 2026-01-20, don't waste time on Google billing/API config, check script implementation first |
| `import-fragrances.mjs`, `build-import-csv.mjs` | Bulk data import |
| `check-brands.mjs`, `check-collections-schema.js`, `rank-image-gaps.mjs` | Read-only diagnostics |
| `dsar-delete-user.mjs` | GDPR data-subject deletion — irreversible, treat as a migration-class action (show what it will do, get sign-off) |
| `ops-health-check.sh`, `ops-migrations-verify.sh`, `ops-claim-legacy-data.sh`, `ops-troubleshoot.sh` | Ops runbook scripts, documented in `scripts/OPS_SCRIPTS_README.md` |
| `seed-discovery-boxes.mjs` / `-new.mjs`, `seed-trails.mjs` | Seed data |
| `populate-buy-urls.mjs` | Affiliate/buy-link population |
| `test-enrichment.mjs`, `verify_seed.js` | Test/verification helpers |
| `manual-image-helper.mjs`, `capture-app-store-screenshots.mjs`, `generate-icons.js`, `generate-placeholder-icons.js`, `launch-orchestrator.sh`, `create-pr.sh` | Misc tooling |
| `extend-library.ts.unused` | Explicitly marked unused — do not run, do not treat as current |

For Shopify-sourced image enrichment specifically (`enrich-images-shopify.mjs`), use the dedicated `shopify-image-enrichment` skill first — it covers storefront verification and name-matching pitfalls this skill does not duplicate.

### Yield circuit-breaker (verified `scripts/enrich-images.mjs`)

This is the load-bearing safety mechanism after the 2026-07 incident where `enrich-images.mjs` ran 53,000 rows at a 0.09% hit rate before a human stopped it (see nota-failure-archaeology for the full incident).

Verified constants and logic (`scripts/enrich-images.mjs` lines 31, 39-40, 247-256):
```js
const force = process.argv.includes('--force');
const YIELD_CHECK_MIN_ROWS = 1000;
const YIELD_CHECK_MIN_RATE = 0.01;   // 1%
```
Behavior: once `totalProcessed >= 1000` (and not a dry run, and `--force` not passed), the script computes `totalHits / totalProcessed`. If that yield is below 1%, it prints a circuit-breaker message and **stops**, requiring `--force` to continue past it.

Operating rule: if you see the circuit-breaker message, **do not reflexively re-run with `--force`**. It means the batch of rows being processed structurally can't be matched this way (e.g. bulk-imported names with no Parfumo/Fragrantica page) — a human should look at a sample of misses first (`scripts/data/image-misses.txt`) and decide whether `--force` is the right call, or whether a different script/approach (Shopify, Wikidata, manual) fits better. This is also the general pattern for any new batch script — see `ai-orchestration-playbook` for the cross-project version of this rule.

Available flags on `enrich-images.mjs`: `--dry-run` (no writes), `--force` (bypass circuit breaker), `--limit=N` (cap rows processed, 0 = no limit).

## 5. Where output lands

| System | What lands there | Verified detail |
|---|---|---|
| Vercel | Production deploys | `https://scentral-hub.vercel.app` (verified `scripts/smoke-test.mjs` default `BASE_URL`). Domain `notalabs.io` purchased 2026-07-04, DNS cutover pending — UNVERIFIED-in-prod whether cutover has happened; check `dig notalabs.io` or the Vercel domains tab |
| Supabase | All app data | Project `scentral-mvp`, id `lrkdwobnemczvhpixpky` (verified AGENTS.md line 44) |
| PostHog | Client analytics events | Gated behind explicit user consent as of commit `8432a7a` ("feat(gdpr): gate PostHog analytics behind explicit user consent", verified `git log`/`git show 8432a7a`, dated 2026-07-05). Env vars `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`. Sentry gating was explicitly called out as NOT done in that same commit message ("Sentry would require runtime-level gating (middleware) — noted for future") |
| Sentry | Error tracking | `next.config.ts`: org `nota-prod`, project `sentry-nota-scent-identity` (verified by grep, this session). **Renamed 2026-07-08** in commit `2078501` (scentral+scentral-hub repo consolidation) from the pre-rebrand slugs `basenote-qn` / `sentry-aquamarine-village` — those old slugs are stale if you see them anywhere else. **UNVERIFIED-in-prod**: whether errors are actually flowing into this org/project today — check the Sentry dashboard directly, do not assume config presence means it's working |

## 6. When NOT to use this skill

- **Diagnosing a slow or timing-out production route** → use `diagnose-prod-slowdown` instead (Vercel runtime logs → Postgres EXPLAIN ANALYZE → fix → re-verify). This skill covers the happy-path run/build/deploy/script commands, not incident root-causing.
- **Commit/branch flow, avoiding duplicate work, deciding branch-vs-main** → use `branch-hygiene` instead.

## Provenance and maintenance

Derived from (re-verify each with the command shown — all checked 2026-07-05):
- `package.json` scripts block — `grep -n -A 12 '"scripts"' package.json`
- `bin/deploy` — `cat bin/deploy`
- `.husky/pre-push` — `cat .husky/pre-push`
- `AGENTS.md` §7 (deploy), §8 (script execution), "Local Dev Setup" — `grep -n "Local Dev Setup\|## 7. Deploying\|## 8. Script execution" AGENTS.md`
- `scripts/enrich-images.mjs` circuit breaker — `grep -n "YIELD_CHECK_MIN_ROWS\|YIELD_CHECK_MIN_RATE\|force =" scripts/enrich-images.mjs`
- Script inventory — `ls scripts/`
- Sentry org/project — `grep -n "org:\|project:" next.config.ts`
- PostHog consent gate commit — `git show --stat 8432a7a`
- Smoke test routes — `grep -n "ROUTES = \[" -A 20 scripts/smoke-test.mjs`

Re-verify before trusting if stale: Vercel webhook reliability (currently asserted from AGENTS.md text, not live-tested — check `vercel ls` vs. Vercel dashboard build history), DNS cutover status for `notalabs.io`, and whether Sentry is actually receiving events in prod.
