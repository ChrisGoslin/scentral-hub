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
