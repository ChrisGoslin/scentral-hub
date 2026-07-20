# QE & Automation Lessons — nota. / scentral-hub

> Append-only record. Format: see SKILL.md "Learning loop". Newest at the bottom.
> Seed entries below import the QE-relevant operational lessons already paid for (AGENTS.md L14–L17) so this file starts with the project's real history, not zero.

## QE-1 (imported, ≤2026-07) — Deploy webhook unreliable; local build is the gate
**Bug class:** deploy pipeline trust — pushes that "should" deploy didn't, or deployed broken builds.
**Guard now in place:** `npm run build` locally before push; deploy explicitly via `npx vercel --prod` and confirm the `▲ Aliased` line (AGENTS.md L14).

## QE-2 (imported, ≤2026-07) — Module-scope Supabase clients break API routes
**Bug class:** request-context leakage — module-level `createClient()` in `app/api` routes.
**Guard now in place:** husky pre-push hook blocks the pattern + tsc failures (AGENTS.md L15).

## QE-3 (imported, ≤2026-07) — New image hosts 500 the Image component
**Bug class:** config-coupled change shipped in two commits instead of one.
**Guard now in place:** new external image domain → `next.config.ts` remotePatterns in the **same commit** (AGENTS.md L16).

## QE-4 (imported, ≤2026-07) — Copy changes silently break text-selector e2e
**Bug class:** brittle test selectors.
**Guard now in place:** prefer `getByRole`; re-run `npm run test:e2e -- --project=chromium` after any copy change (AGENTS.md L17).

## QE-5 (2026-07-04) — CI ran audit only; type/lint errors could reach main via web UI
**Bug class:** gate existed locally (husky) but not server-side — any GitHub-web edit or hook-bypassed push skipped tsc entirely.
**Guard now in place:** `.github/workflows/ci.yml` Stage 1 (tsc + lint on every PR/push to main); staging plan for build/e2e in 06 §1.2.

## QE-6 (2026-07-05) — QE-3/AGENTS.md L16 rule didn't cover search-based enrichment; 12 hosts drifted in silently
**Bug class:** "add remotePatterns host in the same commit" only works when a script writes from one known domain. Generic reverse-image-search enrichment (DuckDuckGo/Google-CSE) can return a hit from any host on the internet — no commit ever touches `next.config.ts` for those, so the allowlist silently falls behind live data. Found via `SELECT DISTINCT host FROM fragrances` — 11 hosts beyond the one that actually crashed a test were already live and unconfigured.
**Guard now in place:** all 12 hosts added to `next.config.ts`; regression test `e2e/discover.spec.ts` asserts a card from the previously-broken host renders. Full incident + the still-open structural gap (no periodic host-audit check) in `nota-failure-archaeology` Incident 11 — re-run the host-audit query periodically, don't assume the allowlist is complete.

## QE-7 (2026-07-05) — `networkidle` wait is a flake source on data-heavy dev pages
**Bug class:** `page.waitForLoadState('networkidle')` against `/discover` (127k-row catalogue + PostHog/analytics keep-alive requests) never reliably settles, causing intermittent 30s timeouts unrelated to the feature under test.
**Guard now in place:** `e2e/discover.spec.ts` rewritten to wait on specific elements (`getByPlaceholder(...)`, `getByText(...)` with explicit `toBeVisible({ timeout })`) instead of `networkidle`. Apply the same pattern to any future spec touching a data-heavy or analytics-instrumented page.

## QE-8 (2026-07-19) — Security tests existed without a runnable package script
**Bug class:** regression tests under `tests/security` were present but `package.json` exposed no unit-test command, so normal project checks could skip them.
**Guard now in place:** `npm run test:unit` runs all `tests/**/*.test.mjs`, including forged wear-log identity and portability preview cases.
