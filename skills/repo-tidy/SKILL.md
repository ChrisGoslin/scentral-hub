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
# Common secret patterns — must return 0 results
grep -rn "sk_live\|sk_test\|service_role\|anon.*key.*=.*['\"]ey" app/ lib/ components/ --include="*.ts" --include="*.tsx"

# Check .env files are gitignored
cat .gitignore | grep env

# Check .env.local is NOT committed
git ls-files | grep ".env"
```

**Expected output:** `.env.local` should NOT appear in `git ls-files`. If it does, remove immediately and rotate any exposed keys.

---

## Phase 3: Dead Code Scrub

```bash
# Find unused component files (not imported anywhere)
for f in $(find app/components -name "*.tsx" -o -name "*.ts"); do
  name=$(basename $f .tsx)
  name=$(basename $name .ts)
  count=$(grep -r "import.*$name\|from.*$name" app/ --include="*.ts" --include="*.tsx" | wc -l)
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
# TypeScript compile check
npx tsc --noEmit 2>&1

# Full build
npm run build 2>&1 | tail -40

# Lint
npm run lint 2>&1 | tail -20
```

**Gate:** All three must pass before merging. A clean `npm run build` is the minimum bar.

---

## Phase 5: Invented Feature Purge

Cross-reference every component and API route against AGENTS.md locked scope.

Scope that is **in** MVP:
- Collection (fragrance browsing)
- Lab (accord creation)
- You (profile/preferences)
- Scheduler "Today" tab (only if real implementation shipped)

Scope that is **out** of MVP (remove if found):
- Commerce / affiliate / payout UI (backend tracking seam only, no UI)
- Social feed
- Pro tier / subscription gating
- pgvector / Resonance Engine
- Any "Agent Luna / Hegemony / Shadow" named component

```bash
# Search for out-of-scope patterns
grep -rn "affiliate\|payout\|resonance\|pgvector\|shadow.*branch\|hegemony" app/ --include="*.tsx" --include="*.ts" -l
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
□ No TypeScript errors (npx tsc --noEmit)
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
