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
```bash
npx tsc --noEmit 2>&1 | tail -20
# no `npm run test` or `npm run typecheck` script exists in this repo (verified against
# package.json 2026-07-05) — use tsc directly for typecheck, and one of the commands
# below for actual test suites:
npm run test:e2e 2>&1 | tail -20
node scripts/smoke-test.mjs 2>&1 | tail -20
```
Verdict: **Verified** if exit 0. **False** if failures.

### "No hardcoded secrets"
```bash
# Check for common secret patterns
grep -r "sk_live\|sk_test\|eyJ\|SUPABASE_SERVICE\|password.*=.*['\"]" app/ lib/ --include="*.ts" --include="*.tsx" -l
grep -rn "process\.env\." app/ lib/ --include="*.ts" --include="*.tsx" | grep -v "process\.env\.[A-Z_]*'" | head -20
```
Verdict: **Verified** if no hardcoded secrets found. **Flag** if any hits.

### "Version X of library Y is used"
```bash
cat package.json | grep '"library-name"'
```
Verdict: **Verified** with actual version shown. Never trust agent's stated version without checking.

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

### Corrections (2026-07-05)
`npm run test` and `npm run typecheck` do not exist in `package.json` (verified: `cat package.json | grep -A1 '"scripts"'`) — the "Tests pass" section above has been fixed to use `npx tsc --noEmit` for typecheck and `npm run test:e2e` / `node scripts/smoke-test.mjs` for actual test runs. There is no unit-test runner (Vitest/Jest) configured in this repo as of this date, despite `qe-automation` describing a Vitest unit layer as the target state — treat "unit tests pass" claims as unverifiable until a unit runner actually exists; check with `grep -n '"vitest"\|"jest"' package.json`.

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
