---
name: safe-commit-shared-repo
description: "Commit safely when a concurrent Claude/Gemini/Antigravity session may be editing scentral-hub at the same time. Prevents sweeping unrelated staged/modified files into your commit. Run before any git add or git commit."
---

# Skill: safe-commit-shared-repo

## Why this exists
On 2026-06-24, mid-session, a plain `git commit` (no pathspec) swept two unrelated changes
already staged by a concurrent session — a `package.json` dependency add and a new script —
into a commit that was supposed to be a single-purpose DB performance fix. Nothing was lost
(git tracks it, content was fine), but the commit message and attribution were wrong, and it
could just as easily have included a half-finished edit mid-write.

This is a structural risk in this repo specifically: a separate Claude/Gemini/Antigravity
session frequently edits `scentral-hub` concurrently and uncoordinated (see AGENTS.md and
project memory). Any git workflow that assumes you're the only one touching the working tree
will eventually commit someone else's in-progress work under your message.

## The rule
**Never `git add -A` and never run a plain `git commit` with no pathspec.** Always commit by
explicit file path, for both the `git add` step and the `git commit` step.

## Procedure

1. **Before touching the index at all**, look at the full picture:
   ```bash
   git status --short
   ```
   The first column is staged status, the second is unstaged. `M `/`A `/`D ` (staged) mean
   *someone* has already run `git add` on that path — if you didn't do it, don't touch it.

2. **If anything is staged that you didn't author**, leave it in the index. Don't `git add`
   over it, don't `git reset` it away (that could discard their work-in-progress), just work
   around it.

3. **Stage only your own new/untracked files explicitly:**
   ```bash
   git add path/to/new-file-1.tsx path/to/new-dir/
   ```
   (Plain `git commit <pathspec>` does NOT pick up untracked files — they must be `git add`ed
   first. It works directly for already-tracked modified files.)

4. **Commit by explicit pathspec — both your newly-staged files and any pre-existing tracked
   files you modified:**
   ```bash
   git commit -m "feat: what you actually built" -- \
     path/to/new-file-1.tsx \
     path/to/modified-file-2.ts \
     path/to/new-dir/
   ```
   This works whether those paths are staged or just modified in the working tree — git
   commits exactly the listed paths' current content, ignoring everything else in the index.

5. **Verify before pushing:**
   ```bash
   git show --stat HEAD
   ```
   Read the file list. If anything you didn't write is in there, you missed a foreign staged
   file — investigate before pushing (do not `git reset --soft HEAD~1` to "fix" it unless you
   understand exactly what's pre-existing work vs. yours; ask the user if unsure).

## What NOT to do
- `git add -A && git commit -m "..."` — commits everything in the working tree, yours or not.
- `git commit -am "..."` — same problem, plus silently stages all tracked-file modifications.
- `git reset --hard` / `git clean -fd` to "clean up" before starting — this can destroy a
  concurrent session's uncommitted work. If the tree looks messy, investigate with
  `git status` first; don't assume it's safe to discard.

## When you find foreign changes mid-task
Don't silently ignore them and don't silently commit them either. Briefly investigate what
they are (read the diff, it's usually obvious — a dependency bump, a new script, a doc edit),
then mention it to the user in your summary. They're tracking two sessions; you're not.
