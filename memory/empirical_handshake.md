---
name: empirical_handshake
description: Verify live state before trusting prior claims or comments — schema drift is common and silent
metadata:
  type: feedback
---

**Rule:** Always verify live schema, DB state, and migration history via Supabase MCP `execute_sql` before trusting prior agent claims, migration comments, or README assertions.

**Why:** 
- Migrations marked "applied" in Supabase Preview don't actually execute their DDL (platform branch-replay quirk).
- Comments describe table structures that don't exist in production (`layering_combinations`, `profiles`, etc.).
- Prior agent phases claimed tables were "seeded" or "applied" but the live schema showed they never ran.
- Silent schema drift accumulates — queries fail at runtime, not at migration-apply time.

**How to apply:**
- Before fixing a migration or asserting "this table exists," run:
  ```sql
  SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'table_name' AND relkind = 'r');
  SELECT * FROM information_schema.columns WHERE table_name = 'table_name';
  ```
- Check `schema_migrations` table to see which versions were actually recorded.
- When a migration comment says "this was applied on 2026-07-04," verify that version exists in the production record.

**Incident:** 
Phase 11 claims that migrations were applied. Phase 12 discovered 40+ migrations with phantom objects, unexecuted guards, and schema drift. Empirical checks against live Supabase revealed the gap.

**Linked resources:** [[phantom_object_pattern]], [[nota_architecture_contract]]
