---
name: db-table-usage-audit
description: "Cross-reference live Supabase schema against app code, table by table, to report ACTIVELY USED / PARTIALLY WIRED / ORPHANED status with cited evidence. Use when the database has moved ahead of what docs describe, before proposing to drop or build against any table, or when planning what schema work to do next."
---

# Skill: db-table-usage-audit

## Purpose

Nota's database has repeatedly drifted ahead of (or been misdescribed by) its own docs — CLAUDE.md has claimed a stale table count and a stale `SHELF_SIZE` value at the same time this skill was written. This skill is the repeatable method for finding out what's actually true: which tables are load-bearing, which are half-wired, and which are dead weight, backed by live schema queries and direct code reads rather than any doc's claims.

## When to invoke

- Before proposing to build a feature against a table you haven't confirmed is actually wired end-to-end.
- Before proposing to drop, rename, or migrate a table that looks unused.
- When asked "what's actually live in the database" or "is the schema ahead of the app."
- As part of a `repo-tidy`-style audit, as a DB-layer companion to its dead-code phase (repo-tidy covers files; this covers tables).

## Workflow

1. **Pull the live schema, not the doc's claim.** Use `list_tables` (Supabase MCP) with `verbose: true` for column-level detail, or `SELECT table_name FROM information_schema.tables WHERE table_schema='public'` if MCP access isn't available. Record row counts — a table with rows but zero code references is a different finding than one with zero rows and zero references.
2. **Grep app code for the literal table name** across every language/framework surface: `app/`, `lib/`, `components/`, `scripts/`, `supabase/functions/`. This is necessary but **not sufficient** — see step 3.
3. **Before asserting ORPHANED, close the dynamic-access blind spot (see `docs/lessons.md` L32):**
   - Check the table's defining migration file(s) for `CREATE FUNCTION` / `CREATE TRIGGER` — a table can be live entirely through an RPC function or trigger with no literal table-name reference in app code.
   - Grep app code for **any** `.rpc(` call at all (not just ones naming the table) — an RPC function's name rarely matches its target table's name.
   - Check for any generic/dynamic query-builder pattern in the codebase (a helper taking a table name as a variable) that would evade literal-string grep.
   - A table found in an unexpected place (e.g. a GDPR delete-list rather than a feature route) is a signal that other unexpected access patterns are plausible in this codebase — don't assume grep-zero means truly unused until the above three checks also come back empty.
4. **Classify each table:**
   - **ACTIVELY USED** — cite the specific file/route that reads or writes it.
   - **PARTIALLY WIRED** — schema exists and is queried, but say exactly which columns or CRUD paths are missing (e.g. a column exists live but is never selected; a table is read-only with no admin/write path). If a table has live row data with no reader, or a "status" column implying a lifecycle transition that no code performs, that's PARTIALLY WIRED with an external-pipeline flag, not ORPHANED — query actual row content (not just counts) to tell the difference.
   - **ORPHANED** — no code reference, no migration function/trigger, no RPC call found. State this only after step 3 is complete.
5. **Report evidence, not conclusions.** Every status needs a cited file path or query result — "reviewed" (grep/read) vs "verified" (live query, direct git log) should be distinguished per the project's standard vocabulary.

## Output standard

A table: `table name | status | evidence`. Flag any anomaly (live data with no consumer, or vice versa) as a direct question to the user rather than a guess.

## Guardrails

- Don't assert a table is safe to drop based on grep alone — that's exactly the mistake L32 exists to prevent.
- Don't fill a gap in evidence with an assumption from the doc describing the schema — the doc is what's suspected to be wrong in the first place.
- If a table has row data with no discoverable consumer anywhere in the checked repo, say so as an open question (possible external pipeline, possible orphaned import) — don't guess which.

## See also

- `repo-tidy` — the file/branch/secrets-level dead-code audit this skill complements at the DB layer.
- `nota-architecture-contract` — the canonical description of which tables/models are load-bearing; reconcile findings here against it and flag drift rather than silently living with it.
- `verify-cli-claims` — general claim-verification discipline this skill's evidence standard is drawn from.

## Provenance and maintenance

Derived from a live audit of scentral-hub's `scentral-mvp` Supabase project (2026-07-27) that found CLAUDE.md's table count (37) was stale against the live count (41), found `shelf_items.tier`/`blind_buy` columns live in schema but never read by app code, and found `trend_signals` receiving live external data with zero in-repo consumer. See `docs/lessons.md` L32.
