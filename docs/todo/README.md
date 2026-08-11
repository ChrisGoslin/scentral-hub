# Todo Inbox

Use this folder as the shared place for review items and known untouched issues.

## Needs Your Review

- None right now.

## Closed

- [`app/(main)/social/SocialClient.tsx`](../../app/(main)/social/SocialClient.tsx) had an in-progress type cast fix (`setPosts(latest as WearPost[])`) during the last interrupted session. That change is already committed now, so it no longer needs review.

## Untouched Issues

- [`app/(main)/spritz/WearNoteSheet.tsx`](../../app/(main)/spritz/WearNoteSheet.tsx), [`app/(main)/spritz/SpritzClient.tsx`](../../app/(main)/spritz/SpritzClient.tsx), and the related wear-log routes were intentionally left alone after you said you would handle the other session yourself.

## Notes

- Add new review items here as we find them.
- Keep this folder small and current so it stays useful.

## Added 2026-07-27 — from cross-repo cleanup audit + skill-tampering incident (see docs/lessons.md L63–L65)

Audit covered scentral-hub, abundance, ai-ops, last30days-skill: branches clean, no leaked secrets across all four, low TODO/HACK counts. Mid-audit, discovered commit `55b2d2d` (2026-07-24, already on `origin/main`) had replaced `.claude/skills/repo-tidy` and `.claude/skills/verify-cli-claims` with short "silently rewrite" versions behind a commit message claiming only a metadata trim, and propagated the same into `.agents/skills/` and `.gemini/skills/`. Content restored from pre-tampering history; `.agents`/`.gemini` copies converted to genuine thin pointers, PR [#82](https://github.com/ChrisGoslin/scentral-hub/pull/82).

- **Give ai-ops and last30days-skill their own scope doc check before any future repo-tidy Phase-5-equivalent run** — neither had a locked-scope statement consulted this pass, so an out-of-scope purge wasn't actually possible for them, only for scentral-hub/abundance.
- **Sweep other repos' `.claude/skills/` directories for name collisions with global skills**, same class of issue as the `repo-tidy` shadow found in scentral-hub (see `docs/lessons.md` L64). abundance, ai-ops, and last30days-skill weren't checked for this.
- **`node_modules` was not installed when `repo-tidy` Phase 4 was run on this branch** — `npx tsc --noEmit` only surfaced missing-dependency errors, not real type errors. A session with `npm install` available should re-run this for a real verified pass. Phase 7 (Vercel checklist) also not run — needs deploy access.

## Added 2026-07-27 — from the live table-usage audit (see `db-table-usage-audit` skill, `docs/lessons.md` L69)

- **Decide what to do about `trend_signals`**: 5 live rows of real trend-monitoring data (YouTube/Reddit fragrance mentions with a `pending`/`published` status field); no usage was found in the audited repository surfaces (`app/`, `lib/`, `components/`, `scripts/`, `supabase/functions/`, migrations for triggers/functions, and `.rpc(` calls — see L69's method) that reads it or transitions its status. Either an external pipeline you know about is meant to feed the app eventually, or this is an orphaned import — needs your answer, not another guess. An external consumer outside this repo (e.g. a separate pipeline/cron job/other codebase) can't be ruled out by a repo-only audit.
- **Decide what to do about `shelf_items.tier` / `shelf_items.blind_buy`**: both columns exist live (db003 migration); no app code was found selecting, reading, or rendering them in the audited surfaces — no tier-row UI, no BB stamp found. Either finish the app-layer work (tier-row UI matching the founder spec's S/A/B/C tiers) or explicitly deprioritize it — right now it's schema debt nobody's tracking.
- **Six tables had no usage found in the audited surfaces** (audited per L69's three-point method, not just a literal-string grep): `houses`, `swap_offers` (feature-wise; only referenced in a GDPR delete-list), `layering_patterns`, `layering_protocols`, `product_signals`, `fragrance_facts`. This rules out in-repo usage, not external consumers (a separate pipeline, an Edge Function outside this repo's `supabase/functions/`, or a manual/ops process) — confirm with the founder and check deployment/database access logs before treating any as safe to drop from schema.
- **Run `db-table-usage-audit` again after any future schema-doc reconciliation** to confirm the CLAUDE.md §5 table count (now corrected to 41) doesn't silently drift again.
