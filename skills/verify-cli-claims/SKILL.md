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
npm run test 2>&1 | tail -20
# or
npm run typecheck 2>&1 | tail -20
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
