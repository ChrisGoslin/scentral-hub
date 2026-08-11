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

1. **Pull the live schema, not the doc's claim.** Use `list_tables` (Supabase MCP) with `verbose: true` for column-level detail, or, if MCP access isn't available:
   ```sql
   SELECT table_name,
     (SELECT count(*) FROM information_schema.columns c
      WHERE c.table_schema = 'public' AND c.table_name = t.table_name) AS column_count
   FROM information_schema.tables t
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
   ```
   Both the outer query and the correlated subquery need `table_schema = 'public'` — filtering only the outer query lets a same-named table in another schema (e.g. `auth.users` vs a hypothetical `public.users`) inflate the column count for the wrong table. The `table_type='BASE TABLE'` filter also matters: `information_schema.tables` also lists views, and a view misclassified as a table produces a false ORPHANED/dead-table recommendation.

   **`information_schema.tables` is privilege-scoped, not a full catalog.** Postgres only returns rows the current role has SELECT (or schema-level) privilege on — a role without full `public` schema access silently sees fewer tables than actually exist, not zero, so an incomplete result looks identical to a complete one. Before trusting the row count as exhaustive: confirm the querying role has broad `public` schema privileges (e.g. `SELECT has_schema_privilege(current_user, 'public', 'USAGE')` plus spot-checking a couple of known tables appear in the result), or prefer the privileged Supabase MCP `list_tables` path, which does not have this gap. If neither can be confirmed, report the audit as **incomplete** for schema coverage rather than treating the returned set as the full table list — and never classify a table missing from this fallback's output as ORPHANED on that basis alone; it may simply be invisible to the current role.

   This fallback still won't give row counts; run a per-table row count as a second step when MCP isn't available. Schema-qualify and safely quote every public-table identifier, either by manually writing trusted identifiers as `public."<table>"` or by generating SQL with `format('%I.%I', 'public', table_name)`:
   ```sql
   SELECT 'shelf_items' AS table_name, count(*) FROM public."shelf_items"
   UNION ALL
   SELECT 'trend_signals', count(*) FROM public."trend_signals"
   ```
   Always schema-qualify, quote identifiers, and label each branch with the table name as shown — an unlabeled `UNION` of bare counts makes it impossible to tell which number belongs to which table once results come back.
2. **Grep every candidate surface for the literal table name**: `app/`, `lib/`, `components/`, `scripts/`, `supabase/functions/`. This is necessary but **not sufficient** — see step 3.
3. **Before asserting ORPHANED, close the dynamic-access blind spot across ALL of the surfaces in step 2, not just `app/`** (see `docs/lessons.md` L69):
   - Check the table's defining migration file(s) for `CREATE FUNCTION` / `CREATE TRIGGER` — a table can be live entirely through an RPC function or trigger with no literal table-name reference anywhere.
   - Grep every surface from step 2 — `app/`, `lib/`, `components/`, `scripts/`, `supabase/functions/` — for **any** `.rpc(` call at all (not just ones naming the table); an RPC function's name rarely matches its target table's name, and a table used only from a script or Edge Function is just as live as one used from `app/`.
   - Check for any generic/dynamic query-builder pattern in the codebase (a helper taking a table name as a variable) that would evade literal-string grep.
   - A table found in an unexpected place (e.g. a GDPR delete-list rather than a feature route) is a signal that other unexpected access patterns are plausible in this codebase — don't assume grep-zero across every surface means truly unused until all of the above checks also come back empty on every surface.
4. **Classify each table:**
   - **ACTIVELY USED** — cite the specific file/route that reads or writes it.
   - **PARTIALLY WIRED** — schema exists and is queried, but say exactly which columns or CRUD paths are missing (e.g. a column exists live but is never selected; a table is read-only with no admin/write path). If a table has live row data with no reader, or a "status" column implying a lifecycle transition that no code performs, that's PARTIALLY WIRED with an external-pipeline flag, not ORPHANED — query actual row content (not just counts) to tell the difference.
   - **ORPHANED** — no code reference, no migration function/trigger, no RPC call found. State this only after step 3 is complete.
5. **Report evidence, not conclusions.** Every status needs a cited file path or query result — "reviewed" (grep/read) vs "verified" (live query, direct git log) should be distinguished per the project's standard vocabulary.

## Output standard

A table: `table name | status | evidence`. Flag any anomaly (live data with no consumer, or vice versa) as a direct question to the user rather than a guess.

## Guardrails

- Don't assert a table is safe to drop based on grep alone — that's exactly the mistake L69 exists to prevent.
- Don't fill a gap in evidence with an assumption from the doc describing the schema — the doc is what's suspected to be wrong in the first place.
- If a table has row data with no discoverable consumer anywhere in the checked repo, say so as an open question (possible external pipeline, possible orphaned import) — don't guess which.

## See also

- `repo-tidy` — the file/branch/secrets-level dead-code audit this skill complements at the DB layer.
- `nota-architecture-contract` — the canonical description of which tables/models are load-bearing; reconcile findings here against it and flag drift rather than silently living with it.
- `verify-cli-claims` — general claim-verification discipline this skill's evidence standard is drawn from.

## Provenance and maintenance

Derived from a live audit of scentral-hub's `scentral-mvp` Supabase project (2026-07-27) that found CLAUDE.md's table count (37) was stale against the live count (41), found `shelf_items.tier`/`blind_buy` columns live in schema but never read by app code, and found `trend_signals` receiving live external data with zero in-repo consumer. See `docs/lessons.md` L69.
