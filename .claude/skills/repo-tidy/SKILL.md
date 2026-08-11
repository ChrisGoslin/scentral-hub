---
name: repo-tidy
description: "7-phase repo cleanup runbook: branch audit, secrets scan, dead code scrub, regression check, out-of-scope purge, git log sanity, Vercel pre-deploy checklist. Run after a multi-session CLI sprint or before any merge to main."
---

# Skill: repo-tidy

## Purpose
Codified cleanup flow for after a CLI agent session. Covers branch cleanup, regression checking, secret scanning, and dead code scrubbing. Run this before merging to main or deploying to Vercel.

---

## When to invoke
- After a multi-session CLI agent sprint
- Before any merge to main
- When the repo feels "cluttered" after heavy experimentation
- After a hallucination/cleanup incident — to restore trust in the codebase

---

## Phase 1: Branch Audit

```bash
# List all local branches
git branch -vv

# List merged branches (safe to delete)
git branch --merged main

# Delete merged branches (one at a time — review first)
git branch -d <branch-name>

# Check for stale remote branches
git fetch --prune
git branch -r
```

**What to look for:**
- Branches named after invented features (e.g., `autopilot-shadow`, `morocco-marketplace`) → delete
- Branches with no commits since last week → delete or archive
- More than 3 active feature branches → pause and assess which are real

---

## Phase 2: Secrets Scan

```bash
# Common secret patterns — must return 0 results. -l (filenames only), never -n:
# a real hit's matched line would print the secret value itself into your terminal/CI log.
grep -rl "sk_live\|sk_test\|service_role\|anon.*key.*=.*['\"]ey" app/ lib/ components/ --include="*.ts" --include="*.tsx"

# Check .env files are gitignored
cat .gitignore | grep env

# Check .env.local is NOT committed
git ls-files | grep ".env"
```

**Expected output:** `.env.local` should NOT appear in `git ls-files`. If it does, remove immediately and rotate any exposed keys.

---

## Phase 3: Dead Code Scrub

```bash
# Find unused component files (not imported anywhere) — both component roots,
# matching the "app/components and components/ both exist" note in Provenance.
for f in $(find app/components components -name "*.tsx" -o -name "*.ts"); do
  name=$(basename $f .tsx)
  name=$(basename $name .ts)
  count=$(grep -r "import.*$name\|from.*$name" app/ components/ --include="*.ts" --include="*.tsx" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "UNUSED: $f"
  fi
done

# Find TODO/FIXME comments left by agents
grep -rn "TODO\|FIXME\|HACK\|XXX\|placeholder\|hardcoded" app/ lib/ --include="*.ts" --include="*.tsx"
```

**Action:** For each unused file, confirm it's truly unreferenced (dynamic imports can fool the grep), then delete.

---

## Phase 4: Regression Check

```bash
set -euo pipefail  # without pipefail, a failing build/lint piped to `tail` can exit 0

# TypeScript compile check. Prefer a package script if one exists; otherwise use
# the locally installed compiler. Do not use bare `npx tsc`.
if npm run | grep -qE '^  typecheck$'; then
  npm run typecheck
elif [ -x node_modules/.bin/tsc ]; then
  node_modules/.bin/tsc --noEmit
else
  echo "UNVERIFIABLE: no package.json typecheck script and node_modules/.bin/tsc is missing."
  exit 1
fi

# Full build
npm run build 2>&1 | tail -40

# Lint
npm run lint 2>&1 | tail -20
```

**Gate:** All three must pass before merging. A clean `npm run build` is the minimum bar. If this phase is skipped for time, the Output's Overall line may NOT read "READY TO MERGE" — use "NEEDS WORK (Phase 4 not run)" instead so a skipped regression check never gets folded into a clean-sounding summary.

---

## Phase 5: Invented Feature Purge

Cross-reference every component and API route against **AGENTS.md §1 "Routes" as it reads
today** — do not use a hardcoded in/out-of-scope list here. Scope has expanded materially over
the project's life (e.g. commerce/affiliate was out of MVP scope, then shipped for real as
`/boxes` + `scripts/populate-buy-urls.mjs` — a hardcoded "remove if found: affiliate" rule
would have deleted real, shipped, intentional work). Re-read AGENTS.md §1 every time you run
this phase; never reuse a scope snapshot from a previous repo-tidy run.

What stays a hard purge regardless of how scope evolves — these are fabricated lore, not
product features, and have never legitimately shipped. **`grounded-agent-guardrails`'s "Known
Fabrications — Never Reintroduce" section is the canonical, single-maintained list — check
there for the current names** (it explicitly says "add to this list the moment you catch a new
one," so it's the one that gets kept current). As of this writing that list includes: "Agent
Luna / Hegemony / Shadow Branching / autopilot-shadow" named components, "Olfactory NFTs /
Invisible Commerce", "Morocco Marketplace Demo" / "Alchemist Knowledge Base" — but re-check the
source skill rather than trusting this copy, which can drift.

```bash
# Search for the lore-fabrication patterns above (NOT a general scope check —
# cross-reference AGENTS.md §1 manually for anything else). -i because these are
# prose names, not identifiers — casing isn't guaranteed. Re-check this pattern
# against grounded-agent-guardrails' "Known Fabrications" list before trusting
# it; that list can grow and this copy can drift (as it already had — missing
# "morocco marketplace" and "alchemist knowledge" until this pass).
grep -rli "agent.luna\|shadow.*branch\|autopilot-shadow\|hegemony\|olfactory.*nft\|invisible.commerce\|morocco.*marketplace\|alchemist.*knowledge" app/ --include="*.tsx" --include="*.ts"
```

---

## Phase 6: Git Log Sanity Check

```bash
# Last 10 commits — do they match what agents claimed?
git log --oneline -10

# Check what actually changed in the last session
git diff HEAD~5 --stat
```

Compare against the agent's summary using the `verify-cli-claims` skill. Any commit that doesn't map to a real task is worth investigating.

---

## Phase 7: Vercel Pre-Deploy Checklist

```
□ npm run build passes locally
□ No TypeScript errors (`npm run typecheck` if configured, otherwise `node_modules/.bin/tsc --noEmit`; no bare `npx tsc`)
□ .env.local variables are set in Vercel dashboard (not hardcoded)
□ NEXT_PUBLIC_ variables are correct for production URL
□ No console.log with sensitive data
□ verify-cli-claims ran and returned ≥ 80% Verified
```

---

## Output

After running all phases, produce a short report:

```
## Repo Tidy Report — [Date]

Phase 1 - Branches: X deleted, Y kept
Phase 2 - Secrets: Clean / ⚠️ Found at [location]
Phase 3 - Dead code: X files removed, Y TODOs flagged
Phase 4 - Regression: Build ✅ / Lint ✅ / TypeCheck ✅
Phase 5 - Scope: Clean / ⚠️ [component] found out of scope
Phase 6 - Git log: Matches agent summary / ⚠️ Discrepancies at [commit]
Phase 7 - Vercel: Ready / ⚠️ Missing env vars: [list]

Overall: READY TO MERGE / NEEDS WORK
```

## When NOT to use this skill

For verifying a specific agent's session claims (not a general repo sweep), use `verify-cli-claims` directly — Phase 6 here calls back to it. For the git-safety mechanics of committing in a concurrently-edited repo, use `safe-commit-shared-repo`. For security-specific findings (RLS, secrets, GDPR), use `security-hardening` — Phase 2 here is a quick secrets grep, not a full security pass.

## See also

- `verify-cli-claims` — Phase 6 (git log sanity) is a direct application of this skill.
- `safe-commit-shared-repo` — read before Phase 1's branch cleanup, since a concurrent session may own an open branch.
- `nota-architecture-contract` — supplementary route/component context for Phase 5's scope-purge; always re-read AGENTS.md §1 first regardless, since scope changes over time and this doc can drift.
- `nota-failure-archaeology` — background on why the fabricated-lore names in Phase 5 exist at all.
- `db-table-usage-audit` — Phase 3's DB-layer companion: this skill's dead-code scrub covers files, that skill covers whether a live database table is actually used, half-wired, or dead weight, with a verification method that closes the dynamic-access/RPC blind spot a plain grep would miss.

## Provenance and maintenance

Derived from: direct testing of each phase's commands against this repo, `.gitignore`, `AGENTS.md` §1.

Re-verify when picking this skill back up:
- `.env.local` still gitignored and not committed: `cat .gitignore | grep env` and `git ls-files | grep ".env"` (second command must return nothing).
- `app/components` and `components/` both still exist as valid scan roots for Phase 3: `ls app/components components`.
- Current in/out-of-scope routes: re-read `AGENTS.md` §1 fresh each run — do not reuse a prior repo-tidy's scope snapshot (this is called out explicitly in Phase 5, but bears repeating here).
