---
name: branch-hygiene
description: "Session-start checklist to prevent duplicate features and stale branches in scentral-hub. Run before writing any code: sync state, check what already exists, decide branch-vs-main, and commit safely at the end."
---

# Skill: Branch Hygiene — Scentral

Run this checklist at the START of every session before writing any code.
Prevents duplicate features, stale branches, and wasted work.

## Step 1 — Sync and orient

```bash
git fetch --all
git log --oneline -8
git branch -a
git status --short
```

Read the output. Answer these before continuing:
- What is the most recent commit? Does it touch the area I'm about to work on?
- Are there any open branches with names related to my task?
- Is my working tree clean?

## Step 2 — Check if the feature already exists

Before building anything, verify it doesn't already exist:

```bash
# Routes
find app -name "page.tsx" | sort

# Components
ls components/ui/
ls app/components/

# Scripts
ls scripts/
```

If a file you are about to create already exists → **stop**. Read the existing file first. Either extend it or confirm it doesn't do what you need before creating a new one.

## Step 3 — Branch decision

Ask: "Is this work risky enough to need a branch?"

**Work directly on main if:**
- Adding a new page that doesn't exist yet
- Adding a component or section to an existing page
- Fixing copy, styles, or empty states
- Adding a script

**Create a branch only if:**
- Modifying the Supabase schema (migrations)
- Refactoring a major shared component that touches 5+ pages
- Work that might break existing routes if it fails

**If you create a branch:**
- Name it descriptively: `feat/onboarding-quiz` not `claude/random-name`
- Merge it to main **in the same session** — do not leave it open
- Run `git diff main --stat` before merging to confirm scope

## Step 4 — After completing the task

A separate Claude/Gemini/Antigravity session may be concurrently editing this same repo
(confirmed recurring pattern — see AGENTS.md and project memory). **Never `git add -A` or
plain `git commit` blindly** — it sweeps in whatever that other session has staged, mixing
unrelated work into your commit message and attribution.

```bash
# Check for changes you didn't make before touching the index
git status --short

# If anything is staged/modified that you didn't author, leave it alone — do not git add -A.
# Commit ONLY the files you actually changed, by explicit path:
git add path/to/your/file1.tsx path/to/your/file2.ts
git commit -m "feat: [what you built]" -- path/to/your/file1.tsx path/to/your/file2.ts

# Verify exactly what landed before pushing
git show --stat HEAD

# MANDATORY build gate - never skip this. On 2026-06-25, three separate commits
# (a stale scripts/ file importing an uninstalled dep, two API routes with
# module-scope createClient() that throws if env vars aren't present at build
# time) reached origin/main with no local build check, and Vercel caught each
# one reactively in production - 19+ failed deploys before being root-caused.
# `npm run build` would have caught every one of them locally, before push.
npm run build

# If your task touched ANY of these, also run the e2e suite before pushing:
# - UI copy / headings / placeholder text (e2e tests assert exact strings)
# - image_url backfill scripts or any new external image source
# - Discover page, Collection page, or You page rendering logic
# Run takes ~10s and catches crashes the build step misses:
npm run test:e2e -- --project=chromium

git push origin main
```

If `npm run build` fails, fix it before pushing — do not push broken commits and let Vercel
be the test suite. This applies even to changes that "shouldn't" affect the build (e.g. a
script in `scripts/`, a debug-only route, a doc change) — that assumption is exactly what
failed here three times in a row.

See `.claude/skills/safe-commit-shared-repo/SKILL.md` for the full checklist.

If you created a branch:
```bash
git checkout main
git merge feat/your-branch
git push origin main
git branch -d feat/your-branch
git push origin --delete feat/your-branch
```

## What this prevents

The failure mode this skill addresses: Claude Code runs a task, creates a branch, pushes it, but doesn't merge — leaving open branches with duplicate implementations of features already on main. Over several sessions this creates:
- 3–5 stale branches with redundant code
- Risk of merge conflicts if they're ever merged
- Confusion about which implementation is canonical

The rule is simple: **main is always the source of truth. Branches are temporary and must be cleaned up in the same session.**

### Corrections (2026-07-05)
`npm run build` and `npm run test:e2e -- --project=chromium` (Step 4) both still exist and run as
described — verified against `package.json` scripts. No drift found.

## When NOT to use this skill

For the git-mechanics of the commit itself (avoiding sweeping in a concurrent session's staged
files), see `safe-commit-shared-repo` — this skill covers the session-level branch/duplicate-work
checklist, that one covers the commit-level git safety. For post-sprint cleanup across multiple
sessions (dead code, stale branches at scale, secrets scan), see `repo-tidy`. For verifying a prior
agent's claims before trusting them, see `verify-cli-claims`.

## See also

- `safe-commit-shared-repo` — the detailed procedure Step 4 here summarizes; read it in full before your first commit of the session.
- `repo-tidy` — the heavier multi-phase cleanup this skill's lightweight Step 2/3 checks feed into.
- `nota-architecture-contract` — canonical route/component inventory for Step 2's "does this already exist" check, instead of re-deriving it from `find`/`ls` each session.

## Provenance and maintenance

Derived from: `package.json` scripts, direct verification of `git config core.hooksPath`, AGENTS.md and project memory references to concurrent-session editing.

Re-verify when picking this skill back up:
- Build/e2e commands still match: `cat package.json | grep -A1 '"scripts"'`.
- Hooks path still `.husky` (affects whether local hooks fire): `git config --get core.hooksPath`.
- Current branch/remote state: `git branch -a && git status --short` (run fresh every session — never trust a prior session's branch list).
