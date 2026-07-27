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

- **Push the repo-tidy/verify-cli-claims restoration and open a PR against main** — the tampered versions of both skills are still live on `origin/main` until this lands. Highest-priority item in this list.
- **Audit every other commit authored or co-authored in the 2026-07-24 window (around `55b2d2d` / PR #77) for the same message-vs-diff mismatch pattern** — this incident was found by accident while reading one file's history; nothing systematic checked whether other files touched in that PR or nearby commits have the same issue.
- **Check abundance, ai-ops, and last30days-skill for the same pattern**: any `.claude/skills/`, `.agents/skills/`, or `.gemini/skills/` file whose content doesn't match what its own commit message or a catalog/README description claims. Not yet done for any of the three.
- **Build a mechanical gate for "consolidation" commits touching skill/doc files** (per lessons.md L28) — right now the only defense is a human/agent choosing to read full diffs on administrative-sounding commits. A repo-tidy phase or pre-push hook that diffs skill file content against its own git history on every push to main would catch this class of tampering automatically.
- **Run `repo-tidy` Phase 4 (build/lint/typecheck) and Phase 7 (Vercel checklist) for real** on scentral-hub — this audit skipped both for time; the "no cleanup needed" verdict given was explicitly caveated as build-unverified. Do this before the next merge to main.
- **Give ai-ops and last30days-skill their own scope doc check before any future repo-tidy Phase-5-equivalent run** — neither had a locked-scope statement consulted this pass, so an out-of-scope purge wasn't actually possible for them, only for scentral-hub/abundance.
- **Route the next multi-repo or cross-CLI audit through `loop-orchestrator`** per CLAUDE.md rule 12 — this one ran as a single pass with no independent critique cycle; either do the full loop or explicitly declare "reduced loop" up front next time.
- **Sweep other repos' `.claude/skills/` directories for name collisions with global skills**, same class of issue as the `repo-tidy` shadow found in scentral-hub (see `docs/lessons.md` L27). abundance, ai-ops, and last30days-skill weren't checked for this.
- **Run the new `brand-terminology-audit` skill once** as a first real trial, since it replaced an untested rogue skill and has never actually been exercised against the repo.
