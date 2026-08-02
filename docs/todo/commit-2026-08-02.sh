#!/usr/bin/env bash
# Commit script for the 2026-08-02 Cowork session (session-memory durability).
# Cowork cannot commit — the mount denies unlink (GL-5). Run this from Claude
# Code or a terminal.
#
# Explicit pathspecs only, per safe-commit-shared-repo: a concurrent
# Claude/Codex/Gemini session may have its own work staged. Never `git add -A`.

set -euo pipefail
cd "$(dirname "$0")/../.."

echo "== Pre-flight =="
git status --short
echo
echo "If anything above was NOT authored by the 2026-08-02 session, stop and"
echo "review before continuing. This script commits only its own paths."
echo
if [[ ! -t 0 ]]; then
  echo "ERROR: run this interactively — it requires confirmation before committing." >&2
  exit 1
fi
ok=""
read -rp "Continue? [y/N] " ok
[[ "$ok" == "y" ]] || { echo "Aborted — nothing committed."; exit 1; }

# 1. Remove the undeletable probe artifact Cowork left behind (L45).
rm -f .loop_probe

# 2. Commit the durability work by explicit path.
PATHS=(
  docs/HANDOVER-2026-08-02-memory-durability.md
  docs/todo/commit-2026-08-02.sh
  docs/todo/claude-code-prompts-2026-08-02.md
  docs/todo/alignment-sweep-addenda-2026-08-02.md
  docs/index.md
  docs/lessons.md
  .claude/skills/branch-hygiene/SKILL.md
  .claude/skills/alignment-sweep/SKILL.md
  .agents/skills/alignment-sweep/SKILL.md
  .gemini/skills/alignment-sweep/SKILL.md
  .claude/skills/repo-tidy/SKILL.md
  .agents/skills/repo-tidy/SKILL.md
  .gemini/skills/repo-tidy/SKILL.md
)

git add -- "${PATHS[@]}"
git commit -m "docs(canon): repair global-instruction routing and skill environment gates

- index.md: External Context repointed to reachable claude-global/ paths.
  GL-3 was marked Resolved 2026-07-29 but the block was never changed;
  commit 3620406 touched the file and still left it. Now carries an inline
  warning naming its own failure window.
- branch-hygiene: Step 0 environment capability probe (non-destructive) and
  a diverged-main path in Step 4. Skill previously prescribed git/build
  commands that cannot run under Cowork, and assumed push always succeeds.
- lessons: L45 (environment-gated skills), L46 (cross-CLI tree divergence).
- handover: findings, open items, and the Cowork preferences block that must
  be pasted by hand.
" -- "${PATHS[@]}"

echo
echo "== Landed =="
git show --stat HEAD

cat <<'NEXT'

== Not done by this script — do these next ==

1. main is [ahead 12, behind 4] of origin/main. Resolve before pushing:
     git rev-list --left-right --count origin/main...main
     git pull --rebase origin main
     npm run build        # MANDATORY after a rebase
     git push origin main

2. Sync the 20 .claude-only skills into .agents/ and .gemini/ (handover item 4),
   then verify parity:
     for d in .claude .agents .gemini; do echo "$d: $(ls $d/skills | wc -l)"; done

3. Delete the stale local branch whose upstream is gone:
     git branch -d integration/homepage-brand-and-fixes

4. Paste the preferences block from the handover into
   Cowork -> Settings -> Personal preferences. No tool can write that surface.
NEXT
