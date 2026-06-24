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
