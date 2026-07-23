---
name: phantom_object_pattern
description: Migrations reference DB objects that were never actually created — critical pre-launch pattern discovered and fixed
metadata:
  type: project
---

**Lesson:** Migrations commonly reference tables, columns, indexes, constraints, or policies that were never created by any migration, or were created by a migration that never ran in production (common on Supabase Preview branch-replay).

**Why:** 
- Supabase Preview branch-replay records migrations as "applied" without executing their DDL (platform quirk).
- Comments describe table structures that don't actually exist in schema.
- Re-versioned migrations obscure whether the original version was ever applied.

**How to apply:**
- Always verify live schema against migration claims via Supabase MCP `execute_sql`.
- Guard every CREATE with `IF NOT EXISTS` or whole-block `DO $ IF to_regclass(...) IS NULL THEN ... END $`.
- When upgrading legacy tables, preserve inert identifier columns (e.g., `anon_id`) if rows might become orphaned — dropping them silently loses data with no recovery path.

**Linked resources:** [[migration_patterns_playbook]], [[empirical_handshake]]
