# Migration Patterns Playbook

> **Living guide to Supabase migration patterns discovered and hardened during pre-launch audit (Phases 11–13, 2026-07-19).**

## The Phantom Object Pattern

**Definition:** A migration references a table, column, index, constraint, or policy that was never actually created by any migration, or was created by a migration that never ran against the target database.

**Common causes:**
- Table created in migration A, but A was never applied to production (Supabase Preview branch-replay quirk, or migration rollback)
- Comment describing a table structure, but no corresponding `CREATE TABLE`
- Migration assumes a column exists and tries to index/constrain it
- Index/constraint name reused across re-versioned migrations, so only one copy exists in `pg_class`/`pg_constraint`

**Production impact:** Silent schema drift. Queries assume a column/index/policy exists, but it doesn't. Backup/restore cycles fail. Migrations abort mid-replay on a fresh environment.

**Detection:**
```sql
-- Check if a table exists
SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'my_table' AND relkind = 'r');

-- Check if a column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'my_table' AND column_name = 'my_column'
);

-- Check if an index exists
SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_my_index');

-- Check if a constraint exists
SELECT EXISTS (
  SELECT 1 FROM pg_constraint 
  WHERE conname = 'constraint_name' AND conrelid = 'my_table'::regclass::oid
);
```

**Fix:**

Guarded DO block (safest for re-versioned migrations):
```sql
DO $$ BEGIN
  IF to_regclass('public.my_table') IS NULL THEN
    CREATE TABLE my_table (
      id uuid PRIMARY KEY,
      ...
    );
  END IF;
END $$;
```

Or guarded individual operations:
```sql
ALTER TABLE my_table ADD COLUMN IF NOT EXISTS new_col text;
CREATE INDEX IF NOT EXISTS idx_my_index ON my_table(new_col);
```

## The Re-versioned Migration Idempotency Gap

**Definition:** A migration renamed to a new timestamp (e.g., `20260703_foo.sql` → `20260704000500_foo.sql`) after Postgres has already recorded it as applied will not re-execute, even with `supabase db push --include-all`, leaving the new operations unperformed.

**Why it happens:**
- Supabase's `schema_migrations` table records migrations by filename + version
- Renaming the file creates a new record that never matched any prior application
- The old version-name was already applied, so the new one appears "new" but with no corresponding work recorded in the database

**Detection:**
- Check `supabase/schema_migrations` table for duplicate logical operations across different version-names
- Run a fresh `supabase db push --include-all` against a test branch and verify all DDL was applied

**Fix:**

Use guarded operations in the new version:
```sql
-- 20260704000500_foo.sql (new version)
ALTER TABLE my_table ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS idx_user_id ON my_table(user_id);

-- Policies require DROP first (no IF NOT EXISTS)
DROP POLICY IF EXISTS "old_policy_name" ON my_table;
CREATE POLICY "old_policy_name" ON my_table
  FOR SELECT USING (auth.uid() = user_id);
```

Or wrap the whole block:
```sql
DO $$ BEGIN
  -- Defensive check: if column already exists, skip
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE my_table ADD COLUMN user_id uuid;
    CREATE INDEX idx_user_id ON my_table(user_id);
  END IF;
END $$;
```

## The RLS Policy Scoping Bug

**Definition:** A policy with `WITH CHECK (true)` and no `TO role` clause applies to `PUBLIC` (all roles), not just authenticated users. Service role bypasses RLS entirely.

**Impact:** Unauthenticated or untrusted roles can bypass row-level access checks.

**Example (wrong):**
```sql
-- This applies to PUBLIC (anyone)
CREATE POLICY "insert_anything" ON my_table
  FOR INSERT
  WITH CHECK (true);

-- Attacker: POST /api/create-temptation?user_id=victim_id → creates row for someone else
```

**Fix (right):**
```sql
-- Explicitly scope to authenticated users
CREATE POLICY "users_own_inserts" ON my_table
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Public read (intentional)
CREATE POLICY "public_read" ON my_table
  FOR SELECT
  USING (true);  -- Clearly intended to be public
```

Service-role inserts need no policy (service role bypasses RLS):
```ts
// app/api/admin/create-temptation/route.ts — uses service-role client
const { data, error } = await supabase.service_role
  .from('temptations')
  .insert([{ user_id, reason, ... }]);  // No RLS check; service role can insert any user_id
```

Authenticated user inserts need scoped policies:
```ts
// app/api/temptations/route.ts — uses createClient(cookieStore), bound to logged-in user
const { data, error } = await supabase
  .from('temptations')
  .insert([{ user_id: session.user.id, reason, ... }]);  // RLS enforces auth.uid() = user_id
```

## The Index Immutability Trap

**Definition:** An index expression using non-immutable functions (e.g., `DATE_TRUNC('week', timestamptz)` without timezone normalization, `CURRENT_DATE`, `NOW()`, or user-defined functions without `IMMUTABLE` marker) fails at index-creation time.

**Detection:** PostgreSQL error:
```
ERROR: functions used in index expression must be marked IMMUTABLE
```

**Fix:**

Normalize timezone before truncation:
```sql
-- Wrong: timezone-dependent
CREATE INDEX idx_week ON my_table(DATE_TRUNC('week', created_at));

-- Right: normalize to UTC first
CREATE INDEX idx_week ON my_table(
  DATE_TRUNC('week', (created_at AT TIME ZONE 'UTC')) DESC
);
```

Also watch for ISO week vs. Sunday week boundaries:
```sql
-- App uses: `new Date().getUTCDay()` (0=Sunday)
-- So Sunday-start week = `today - getUTCDay()`

-- Postgres ISO_WEEK starts Monday, so adjust:
CREATE INDEX idx_week_aligned ON my_table(
  DATE_TRUNC('week', (created_at AT TIME ZONE 'UTC') + INTERVAL '1 day') - INTERVAL '1 day'
);
```

## The Constraint Ordering Dependency

**Definition:** PostgreSQL operations must respect object dependencies. Dropping a column while a policy references it, or updating a column with a `CHECK` constraint while the constraint is still active, fails with dependency errors.

**Correct order:**
1. Drop policies that reference the column/constraint
2. Drop constraints that restrict the value
3. Update the column value
4. Recreate constraints
5. Recreate policies

**Example (wrong):**
```sql
-- Error: CHECK constraint still exists and only allows old values
UPDATE my_table SET status = 'new_value' WHERE status = 'old_value';
ALTER TABLE my_table DROP CONSTRAINT status_check;
```

**Example (right):**
```sql
-- Drop constraint first
ALTER TABLE my_table DROP CONSTRAINT status_check;
-- Now update
UPDATE my_table SET status = 'new_value' WHERE status = 'old_value';
-- Recreate with new enum
ALTER TABLE my_table ADD CONSTRAINT status_check
  CHECK (status IN ('new_value', 'other_value'));
```

## The Data Preservation Principle

**Definition:** When upgrading legacy tables from one identifier scheme to another (e.g., `anon_id text` → `user_id uuid`), preserve the old identifier column if any rows might become orphaned (no way to derive `user_id` for rows that never completed the "claim on sign-in" flow).

**Impact:** Silently dropping `anon_id` loses the only reference to unclaimed shelves, wishlists, and preference data. Data is not deleted, just unreachable.

**Example (wrong):**
```sql
-- Before: unclaimed rows have anon_id only
-- After: anon_id dropped, user_id is NULL, row is lost
ALTER TABLE collections DROP COLUMN anon_id;
```

**Example (right):**
```sql
-- Leave anon_id in place, unindexed and policy-unreferenced
-- ALTER TABLE collections DROP COLUMN anon_id;  -- commented out
-- Manual reconciliation can still match anon_id → user_id if needed later

-- New flows use user_id only
ALTER TABLE collections ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
```

## Testing Re-versioned Migrations

Before pushing a re-versioned migration:

1. **Against production schema:**
   ```bash
   psql $PROD_DB_URL -c "
     SELECT migration, executed_at FROM schema_migrations 
     WHERE migration LIKE '20260703%' OR migration LIKE '20260704%'
     ORDER BY migration;
   "
   ```
   Verify the old version exists, new version does not.

2. **Run a fresh replay:**
   ```bash
   supabase db reset --local  # Clears local schema
   supabase db push           # Re-applies all migrations
   ```
   Verify the table/index/policy exists and has the expected structure.

3. **Verify idempotency:**
   ```bash
   supabase db push --include-all  # Re-run migrations
   ```
   Should produce no errors or `already exists` warnings for guarded operations.

## Lessons Locked

- **Empirical Handshake:** Always verify live schema before trusting migration comments. Use Supabase MCP `execute_sql` or psql against production.
- **Never assume column/index/policy existence.** Guard every creation and alteration.
- **Policies with `WITH CHECK (true)` and no `TO` clause are intentionally public. Document why.**
- **Preserve historical identifiers** even if they're no longer used. Dropping them silently loses data.
- **Test re-versioned migrations on a fresh schema.** If it fails on a clean slate, it will fail on the customer's database too.
