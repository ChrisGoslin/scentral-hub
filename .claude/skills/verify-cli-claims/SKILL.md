---
name: verify-cli-claims
description: "Read-only verification agent. Takes a CLI agent's 'done!' summary and proves each claim against the actual repo, filesystem, and build output. Returns Verified / Unverified / False per claim. Run after any Claude Code, Antigravity, or Gemini session before merging or deploying."
---

# Skill: verify-cli-claims

## Purpose
Read-only verification agent. Takes a CLI agent's "done!" summary and proves or disproves each claim against the actual repo, filesystem, and build output. Returns a verdict per claim: **Verified**, **Unverified**, or **False**.

This exists because CLI agents frequently produce confident summaries that don't match reality. This skill is the insurance layer — run it after any agent session before merging or deploying.

---

## When to invoke
- After any Claude Code, Antigravity, Gemini, or other CLI agent session
- Before merging a branch to main
- Before pushing to Vercel
- Any time an agent summary uses phrases like "complete", "working", "production-ready", "LGTM", or "breakthrough"

---

## How to use

1. Paste or describe the agent's summary
2. This skill extracts each factual claim
3. For each claim, it runs the appropriate check (see verification methods below)
4. Returns a verdict table

---

## Verification Methods by Claim Type

### "File X was created / modified"
```bash
# Check file exists
ls -la <path>

# Check it was recently modified
git status
git diff HEAD~1 --name-only

# Check it's not empty
wc -l <path>
```
Verdict: **Verified** if file exists at stated path with non-trivial content. **False** if missing or empty.

### "Feature X is implemented"
```bash
# Search for the implementation
grep -r "functionName\|ComponentName\|routeName" app/ --include="*.ts" --include="*.tsx" -l

# Check it's wired up (imported/used somewhere)
grep -r "import.*ComponentName\|from.*routeName" app/ -l
```
Verdict: **Verified** if code exists AND is imported/used. **Unverified** if code exists but isn't wired up. **False** if not found.

### "Database table/column X exists"
Use Supabase MCP:
```
list_tables → check table is present
execute_sql: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'X'
```
Verdict: **Verified** if table/column present in schema. **False** if not found.

### "Migration was applied"
```
list_migrations → check migration name/timestamp appears
execute_sql: SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5
```
Verdict: **Verified** if migration appears in history. **False** if not.

### "App builds without errors"
```bash
cd /path/to/repo && npm run build 2>&1 | tail -30
```
Verdict: **Verified** if build exits 0 with no error lines. **False** if build fails.

### "Tests pass"
Don't hardcode a script name — read `package.json`'s `scripts` block fresh, since it drifts (as of 2026-07-27 it has `test:e2e`, `test:smoke`, `test:smoke:prod`, `test:unit`, none of which existed the same way on 2026-07-05). Run whichever of these exist via `npm run <script>`, not by invoking the underlying file directly:
```bash
set -o pipefail  # without this, a failing command piped to `tail` still exits 0
cat package.json | grep -A1 '"scripts"' # or: node -e "console.log(Object.keys(require('./package.json').scripts))"
# No dedicated typecheck script exists. Use the locally installed compiler (node_modules/.bin/tsc),
# never bare `npx tsc` — with no version pin, npx can resolve a compiler from the registry instead
# of the declared package.json devDependency, which is both a correctness risk (different TS
# version, different diagnostics) and a supply-chain risk (MCP/registry "rug pull" — see the tool
# note this section carries). If node_modules/.bin/tsc isn't present, the check is Unverifiable,
# not "run npx and hope."
if [ -x node_modules/.bin/tsc ]; then
  node_modules/.bin/tsc --noEmit 2>&1 | tail -20
else
  echo "UNVERIFIABLE: node_modules/.bin/tsc not present — do not fall back to unpinned npx tsc."
fi
npm run test:e2e 2>&1 | tail -20         # if present
npm run test:smoke 2>&1 | tail -20       # if present — do not call scripts/smoke-test.mjs directly
npm run test:smoke:prod 2>&1 | tail -20  # if present — hits the deployed BASE_URL, only run when a live deploy claim is being checked
npm run test:unit 2>&1 | tail -20        # if present
```
Verdict: **Verified** if the commands that exist all exit 0. **Unverifiable** (not False) for any test category whose package script doesn't exist — say so explicitly rather than inventing a direct file invocation.

### "No hardcoded secrets"
```bash
# Check for common secret patterns — scripts/ (.mjs) and config files leak secrets just
# as easily as app/lib, and a scan that only covers app/lib can't back a repo-wide claim.
grep -rl "sk_live\|sk_test\|eyJ\|SUPABASE_SERVICE\|password.*=.*['\"]" app/ lib/ scripts/ supabase/functions/ --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.js"
grep -rl "process\.env\." app/ lib/ scripts/ --include="*.ts" --include="*.tsx" --include="*.mjs"
```
Verdict: **Verified** if no hardcoded secrets found. **Flag** if any hits.

### "Version X of library Y is used"
```bash
cat package.json | grep '"library-name"'
```
Verdict: **Verified** with actual version shown. Never trust agent's stated version without checking.

### "Rule/check X is why CI failed" (a specific third-party rule ID, lint rule, or tool behavior named as root cause)
An agent naming a specific rule ID (e.g. "SonarJS S2681"), severity level, or tool-behavior claim as the diagnosis for a real failure — not just applying it as general practice — is asserting something checkable. A plausible-sounding rule ID is not a verified one (see `docs/lessons.md` L68: a real session named the wrong rule ID, at the wrong severity, and the "fix" had zero effect on the actual failure).
```bash
# The rule ID/behavior must be checked against the tool's own docs or a search,
# not recalled from memory, before it's committed as the stated justification for a fix.
# WebSearch/WebFetch the rule ID directly, e.g.:
#   site:rules.sonarsource.com <rule-id>
#   site:docs.github.com <specific behavior claim>
```
Verdict: **Verified** if the rule ID, its type (Bug/Code Smell/Vulnerability/Security Hotspot), and severity are confirmed against the tool's own documentation. **Unverified** if the agent named a rule from memory and the claim wasn't checked. **Red flag**: if a "fix" for a specific named rule was pushed and the same CI check failed again on the next run with the same message — that is direct evidence the diagnosis was wrong, and the next step must be verification, not a second guess.

---

## Output Format

After running checks, produce this table:

```
## Verification Report — [Agent Name] Session [Date]

| # | Claim | Check Run | Verdict | Evidence |
|---|-------|-----------|---------|----------|
| 1 | "CommentSection component created" | ls + grep import | ✅ Verified | app/components/CommentSection.tsx exists, imported in AccordDetail.tsx |
| 2 | "Migration 20260604_phase3 applied" | list_migrations | ✅ Verified | Appears in migration history |
| 3 | "76 fragrances seeded" | SELECT count(*) | ✅ Verified | count = 76 |
| 4 | "App builds clean" | npm run build | ❌ False | Build failed: Module not found './CommentSection' |
| 5 | "No hardcoded keys" | grep secrets | ⚠️ Unverified | Found 1 suspicious line in api/route.ts:14 — needs manual review |

### Summary
- Verified: 3/5
- False: 1/5 (build failure — do not merge)
- Unverified: 1/5 (manual review needed)

### Recommended action
DO NOT MERGE until build failure resolved. Investigate line api/route.ts:14.
```

---

## Red Flag Phrases

If the agent summary contains any of these, treat every claim as unverified until checked:

- "MASTERPIECE" / "breakthrough" / "elite"
- "production-ready" (without a passing build)
- "complete" (without file verification)
- "LGTM" (without running the checks above)
- Any invented name not in AGENTS.md ground truth
- Version numbers stated without citing package.json

---

## Scope

This skill is **read-only**. It does not:
- Modify files
- Apply migrations
- Run deployments

It only inspects and reports. All fixes are the human's (or next agent session's) responsibility.

### Corrections (2026-07-05, superseded 2026-07-29 — see below)
`npm run test` and `npm run typecheck` do not exist in `package.json`. There is no unit-test runner (Vitest/Jest) configured in this repo as of this date, despite `qe-automation` describing a Vitest unit layer as the target state — treat "unit tests pass" claims as unverifiable until a unit runner actually exists; check with `grep -n '"vitest"\|"jest"' package.json`.

### Correction (2026-07-29)
The line above once told readers to run `node scripts/smoke-test.mjs` directly. That contradicts the "Tests pass" section above, which explicitly requires `npm run <script>` invocation (never the raw file) so drift in the underlying command is caught by `package.json`, not hardcoded here. If this file and the "Tests pass" section ever disagree again, the "Tests pass" section wins — it is re-verified against live `package.json` per session; this historical note is not.

### Correction (2026-07-29) — pre-push/pre-commit hook claims need hook-firing proof, not script-output proof
A hook file existing in `.husky/` (or any git-hooks directory) and passing when invoked manually (`node scripts/x.mjs`) is not evidence the hook fires on a real `git push`/`git commit`. Verify hook wiring itself before trusting any "guard blocks bad pushes" claim:
```bash
git rev-parse --git-path hooks    # find the real hooks dir
git config --get core.hooksPath   # confirm it points at .husky (or wherever the hook file lives)
# Check every hook the claim actually names, not just pre-push — a claim that says
# "the pre-commit hook blocks X" is unverified if only pre-push is checked, and vice versa.
for hook in pre-push pre-commit; do
  ls -la "$(git rev-parse --git-path hooks)/$hook" 2>/dev/null || echo "MISSING: $hook not installed at resolved hooks path"
done
ls node_modules/.bin/husky 2>/dev/null   # confirm husky itself was installed, not just referenced in package.json
```
**Verdict: Verified** only for each specific hook where `core.hooksPath` resolves to the directory containing that hook's file AND the hook file is present at that resolved path AND (for husky) the binary is installed — check every hook named by the claim independently, since one can be wired while another isn't. **False** for any named hook missing one of those three. In that case, every prior "guard fired correctly" claim about that hook in the session was actually a manual script invocation, not a real hook execution, and must be re-labeled as such.

## When NOT to use this skill

This is a generic, cross-project claim-verification technique — it works the same in scentral-hub, household-finance, or any repo. For scentral-hub-specific "what changed and does it match the session summary" cleanup, pair it with `repo-tidy` (Phase 6 explicitly calls back to this skill). For verifying an agent's claims about a live Supabase/Vercel deploy specifically (not just the repo), also check `nota-run-and-operate`.

## See also

- `repo-tidy` — Phase 6 (git log sanity) uses this skill directly; run them together after a multi-session sprint.
- `nota-run-and-operate` — the actual day-to-day commands (build/deploy/smoke) this skill verifies claims about.
- `ai-orchestration-playbook` (cross-project) — the broader discipline of not trusting a subagent's "done" without independent verification; this skill is one concrete technique within that discipline.

## Provenance and maintenance

Derived from: `package.json` scripts, direct testing of each verification command against this repo.

Re-verify when picking this skill back up:
- Available scripts: `cat package.json | grep -A1 '"scripts"'`.
- Whether a unit-test runner has been added since: `grep -n '"vitest"\|"jest"' package.json`.
- Build command still `npm run build`: confirm in `package.json`.
