-- DB-006: Migrate legacy tables from anon_id (text) to user_id (uuid) for auth integration
-- Adds user_id column to temptations, shelf_events, evolution_events, noseprint_history
-- Keeps anon_id for backward compatibility; RLS policies updated to support both
--
-- 20260703000600_temptations.sql and 20260703000500_shelf_events_table.sql
-- were rewritten (2026-07-18) to match the live production shape, which is
-- already user_id-only with no anon_id column at all — this migration's
-- original unconditional "add user_id, keep anon_id, support both" steps
-- for those two tables would now fail (duplicate column / anon_id doesn't
-- exist). Steps 1, 2, 6, and 7 below are guarded to no-op wherever anon_id
-- is already absent, since that means the table is already in its final
-- user_id-only state and needs no transition. evolution_events and
-- noseprint_history are untouched by that rewrite, so their steps are
-- unchanged.

-- Step 1: Add user_id to temptations (nullable during transition) — only
-- where temptations still has anon_id (i.e. hasn't already been rewritten
-- to its final user_id-only shape).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'temptations' AND column_name = 'anon_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'temptations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE temptations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Step 2: Add user_id to shelf_events (nullable during transition) — same guard.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'shelf_events' AND column_name = 'anon_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'shelf_events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE shelf_events ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Step 3: Add user_id to evolution_events (nullable during transition).
-- This file was re-versioned from 20260704_db006_identity_model_migration.sql
-- — on any database where the original version already applied, these
-- columns already exist, and a bare ADD COLUMN would abort with "column
-- already exists" and block every later migration. Same guard as
-- temptations/shelf_events above.
ALTER TABLE evolution_events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Add user_id to noseprint_history (nullable during transition)
ALTER TABLE noseprint_history ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Add indexes for new user_id columns (same as anon_id).
CREATE INDEX IF NOT EXISTS idx_temptations_user_id ON temptations(user_id);
CREATE INDEX IF NOT EXISTS idx_shelf_events_user_id ON shelf_events(user_id);
CREATE INDEX IF NOT EXISTS idx_evolution_events_user_id ON evolution_events(user_id);
CREATE INDEX IF NOT EXISTS idx_noseprint_history_user_id ON noseprint_history(user_id);

-- Step 6: Update RLS policies to support both anon_id and user_id (auth)
-- (These are re-creations of existing policies with user_id support added)
--
-- Wrapped in dynamic SQL guarded on anon_id still existing: a bare
-- CREATE POLICY referencing anon_id fails at execution time (not file-parse
-- time) once temptations/shelf_events no longer have that column, which is
-- their already-final live shape. Where anon_id is already gone, the
-- rewritten 20260703000600/20260703000500 migrations already created the
-- correct final "own rows" auth.uid()-only policy — nothing to do here.

-- Drop old temptations policies
DROP POLICY IF EXISTS "Users can view own temptations" ON temptations;
DROP POLICY IF EXISTS "Users can update own temptations" ON temptations;
DROP POLICY IF EXISTS "System can insert temptations" ON temptations;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'temptations' AND column_name = 'anon_id'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view own temptations" ON temptations
        FOR SELECT USING (
          (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
        )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Users can update own temptations" ON temptations
        FOR UPDATE USING (
          (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
        ) WITH CHECK (
          (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
        )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "System can insert temptations" ON temptations
        FOR INSERT WITH CHECK (true)
    $policy$;
  END IF;
END
$$;

-- Step 7: Update shelf_events RLS — same guard.
DROP POLICY IF EXISTS "Users can view their own shelf events" ON shelf_events;
DROP POLICY IF EXISTS "Users can create shelf events" ON shelf_events;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'shelf_events' AND column_name = 'anon_id'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view their own shelf events" ON shelf_events
        FOR SELECT USING (
          (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
        )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Users can create shelf events" ON shelf_events
        FOR INSERT WITH CHECK (
          (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
        )
    $policy$;
  END IF;
END
$$;

-- Step 8: Update evolution_events RLS
DROP POLICY IF EXISTS evolution_events_select ON evolution_events;
DROP POLICY IF EXISTS evolution_events_insert ON evolution_events;
DROP POLICY IF EXISTS evolution_events_update ON evolution_events;

CREATE POLICY evolution_events_select ON evolution_events
  FOR SELECT USING (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

CREATE POLICY evolution_events_insert ON evolution_events
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

CREATE POLICY evolution_events_update ON evolution_events
  FOR UPDATE USING (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  ) WITH CHECK (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

-- Step 9: Update noseprint_history RLS
DROP POLICY IF EXISTS noseprint_history_select ON noseprint_history;
DROP POLICY IF EXISTS noseprint_history_insert ON noseprint_history;

CREATE POLICY noseprint_history_select ON noseprint_history
  FOR SELECT USING (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

CREATE POLICY noseprint_history_insert ON noseprint_history
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

-- Claim flow note (implemented in app code, not SQL):
-- On first authenticated session, run:
--   1. Get user_id from auth
--   2. Query profiles(anon_id) for current anon_id
--   3. UPDATE all legacy tables WHERE anon_id = current_anon_id SET user_id = auth.uid()
--   4. Migrate localStorage scentral_wishlist → collections(user_id, status='wishlist')
-- This allows silent claiming without user interaction.
