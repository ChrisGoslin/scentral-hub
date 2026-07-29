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

## Added 2026-07-27 — from cross-repo cleanup audit + skill-tampering incident (see docs/lessons.md L26–L28)

Audit covered scentral-hub, abundance, ai-ops, last30days-skill: branches clean, no leaked secrets across all four, low TODO/HACK counts. Mid-audit, discovered commit `55b2d2d` (2026-07-24, already on `origin/main`) had replaced `.claude/skills/repo-tidy` and `.claude/skills/verify-cli-claims` with short "silently rewrite" versions behind a commit message claiming only a metadata trim, and propagated the same into `.agents/skills/` and `.gemini/skills/`. Content restored from pre-tampering history; `.agents`/`.gemini` copies converted to genuine thin pointers, PR [#82](https://github.com/ChrisGoslin/scentral-hub/pull/82).

- **Give ai-ops and last30days-skill their own scope doc check before any future repo-tidy Phase-5-equivalent run** — neither had a locked-scope statement consulted this pass, so an out-of-scope purge wasn't actually possible for them, only for scentral-hub/abundance.
- **Sweep other repos' `.claude/skills/` directories for name collisions with global skills**, same class of issue as the `repo-tidy` shadow found in scentral-hub (see `docs/lessons.md` L27). abundance, ai-ops, and last30days-skill weren't checked for this.
- **`node_modules` was not installed when `repo-tidy` Phase 4 was run on this branch** — `npx tsc --noEmit` only surfaced missing-dependency errors, not real type errors. A session with `npm install` available should re-run this for a real verified pass. Phase 7 (Vercel checklist) also not run — needs deploy access.

## Added 2026-07-27 — from the live table-usage audit (see `db-table-usage-audit` skill, `docs/lessons.md` L32)

- **Decide what to do about `trend_signals`**: 5 live rows of real trend-monitoring data (YouTube/Reddit fragrance mentions with a `pending`/`published` status field) with zero code anywhere in this repo that reads it or transitions its status. Either an external pipeline you know about is meant to feed the app eventually, or this is an orphaned import — needs your answer, not another guess.
- **Decide what to do about `shelf_items.tier` / `shelf_items.blind_buy`**: both columns exist live (db003 migration), but no app code selects, reads, or renders them — no tier-row UI, no BB stamp. Either finish the app-layer work (tier-row UI matching the founder spec's S/A/B/C tiers) or explicitly deprioritize it — right now it's schema debt nobody's tracking.
- **Six tables are genuinely dead weight** (verified, not just grepped — see L32's three-point method): `houses`, `swap_offers` (feature-wise; only referenced in a GDPR delete-list), `layering_patterns`, `layering_protocols`, `product_signals`, `fragrance_facts`. Confirm with the founder whether any were meant to ship and got dropped, or whether they're safe to drop from schema.
- **Run `db-table-usage-audit` again after any future schema-doc reconciliation** to confirm the CLAUDE.md §5 table count (now corrected to 41) doesn't silently drift again.
