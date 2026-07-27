# Todo Inbox

Use this folder as the shared place for review items and known untouched issues.

## Needs Your Review

- [`app/(main)/social/SocialClient.tsx`](../../app/(main)/social/SocialClient.tsx) has an in-progress type cast fix (`setPosts(latest as WearPost[])`) that was already present in the worktree before the last interruption. Still left untouched — not committed this pass either, review and commit separately.

## Untouched Issues

- [`app/(main)/spritz/WearNoteSheet.tsx`](../../app/(main)/spritz/WearNoteSheet.tsx), [`app/(main)/spritz/SpritzClient.tsx`](../../app/(main)/spritz/SpritzClient.tsx), and the related wear-log routes were intentionally left alone after you said you would handle the other session yourself.
- `.playwright-cli/` and `output/` are generated artifacts from the last local run and have not been cleaned up.

## Notes

- Add new review items here as we find them.
- Keep this folder small and current so it stays useful.

## Added 2026-07-17

- [`app-store-launch-checklist.md`](app-store-launch-checklist.md) — App Store screenshot/story sequence from the teardown's §7, converted into an owned checklist per the teardown's Pre-Launch Cut section.

## Added 2026-07-27 — from cross-repo cleanup audit + skill-tampering incident (see docs/lessons.md L26–L28)

Audit covered scentral-hub, abundance, ai-ops, last30days-skill: branches clean, no leaked secrets across all four, low TODO/HACK counts. Mid-audit, discovered commit `55b2d2d` (2026-07-24, already on `origin/main`) had replaced `.claude/skills/repo-tidy` and `.claude/skills/verify-cli-claims` with short "silently rewrite" versions behind a commit message claiming only a metadata trim, and propagated the same into `.agents/skills/` and `.gemini/skills/`. Content restored from pre-tampering history; `.agents`/`.gemini` copies converted to genuine thin pointers. Fix lives on `claude/work-cleanup-audit-7hio23`, not yet pushed/PR'd against main as of this writing.

- ~~Push the repo-tidy/verify-cli-claims restoration and open a PR against main~~ — done, [PR #82](https://github.com/ChrisGoslin/scentral-hub/pull/82).
- ~~Build a mechanical gate for skill-file tampering~~ — done: `scripts/check-skill-integrity.mjs` + `docs/skills.lock.json`, wired into `.husky/pre-push` (runs on every branch, not just main), `npm run skills:relock` / `npm run skills:check`. See lessons.md L30.
- ~~Build a GitHub Actions twin of `scripts/check-skill-integrity.mjs`~~ — done: `.github/workflows/skill-integrity.yml`, runs on push/PR to main, closes the GitHub-UI-merge gap.
- ~~Audit every other commit authored or co-authored in the 2026-07-24 window (around `55b2d2d` / PR #77) for the same message-vs-diff mismatch pattern~~ — done: reviewed the full `55b2d2d` diff file-by-file. Found one more issue — the commit silently dropped `nota-portability-concierge`'s row from `.claude/skills/README.md` while never deleting the skill itself; restored. Everything else in that commit (the new `canonical-source-reconciler`/`loop-orchestrator` skills, the `nota-architecture-contract` correction) checked out as legitimate.
- ~~Check abundance, ai-ops, and last30days-skill for the same pattern~~ — done: `abundance` has no skills directory at all. `ai-ops` and `last30days-skill` were grepped for "silently"-style instructions in their `SKILL.md` files — all hits in both are legitimate documentation of deliberate skip/silence behavior, not tampering. `ai-ops` already has its own dedicated `third-party-skill-security` skill covering this class of risk. **Neither has the new lockfile guard** — not built for them in this pass since no compromise was found there; revisit if either repo grows more skill-editing traffic.
- ~~Run `repo-tidy` Phase 4 (build/lint/typecheck) for real on scentral-hub~~ — partially done: `node_modules` is not installed in this environment, so `npx tsc --noEmit` only surfaced missing-dependency errors (`Cannot find module '@supabase/ssr'`, etc.), not real type errors — this is **reviewed, not verified**. A session with `npm install` available should re-run this for a real verified pass before the next merge to main. Phase 7 (Vercel checklist) not run — needs a session with deploy access.
- **Give ai-ops and last30days-skill their own scope doc check before any future repo-tidy Phase-5-equivalent run** — neither had a locked-scope statement consulted this pass, so an out-of-scope purge wasn't actually possible for them, only for scentral-hub/abundance.
- ~~Run a real trial of `brand-terminology-audit`~~ — done, clean result: no retired-name hits in `app/`/`components/`, no stale prototype branches (only `main` and the active work branch exist).
- **Route the next multi-repo or cross-CLI audit through `loop-orchestrator`** per CLAUDE.md rule 12 — this one ran as a single pass with no independent critique cycle; either do the full loop or explicitly declare "reduced loop" up front next time.
- **Sweep other repos' `.claude/skills/` directories for name collisions with global skills**, same class of issue as the `repo-tidy` shadow found in scentral-hub (see `docs/lessons.md` L27). abundance, ai-ops, and last30days-skill weren't checked for this.
- **Run the new `brand-terminology-audit` skill once** as a first real trial, since it replaced an untested rogue skill and has never actually been exercised against the repo.
