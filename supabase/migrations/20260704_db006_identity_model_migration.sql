-- DB-006: Migrate legacy tables from anon_id (text) to user_id (uuid) for auth integration
-- Adds user_id column to temptations, shelf_events, evolution_events, noseprint_history
-- Keeps anon_id for backward compatibility; RLS policies updated to support both

-- Step 1: Add user_id to temptations (nullable during transition)
ALTER TABLE temptations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Add user_id to shelf_events (nullable during transition)
ALTER TABLE shelf_events ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Add user_id to evolution_events (nullable during transition)
ALTER TABLE evolution_events ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Add user_id to noseprint_history (nullable during transition)
ALTER TABLE noseprint_history ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Add indexes for new user_id columns (same as anon_id)
CREATE INDEX idx_temptations_user_id ON temptations(user_id);
CREATE INDEX idx_shelf_events_user_id ON shelf_events(user_id);
CREATE INDEX idx_evolution_events_user_id ON evolution_events(user_id);
CREATE INDEX idx_noseprint_history_user_id ON noseprint_history(user_id);

-- Step 6: Update RLS policies to support both anon_id and user_id (auth)
-- (These are re-creations of existing policies with user_id support added)

-- Drop old temptations policies
DROP POLICY IF EXISTS "Users can view own temptations" ON temptations;
DROP POLICY IF EXISTS "Users can update own temptations" ON temptations;
DROP POLICY IF EXISTS "System can insert temptations" ON temptations;

-- Create new temptations policies that support both auth and anon
CREATE POLICY "Users can view own temptations" ON temptations
  FOR SELECT USING (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

CREATE POLICY "Users can update own temptations" ON temptations
  FOR UPDATE USING (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  ) WITH CHECK (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

CREATE POLICY "System can insert temptations" ON temptations
  FOR INSERT WITH CHECK (true);

-- Step 7: Update shelf_events RLS
DROP POLICY IF EXISTS "Users can view their own shelf events" ON shelf_events;
DROP POLICY IF EXISTS "Users can create shelf events" ON shelf_events;

CREATE POLICY "Users can view their own shelf events" ON shelf_events
  FOR SELECT USING (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

CREATE POLICY "Users can create shelf events" ON shelf_events
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) OR (anon_id = current_setting('app.current_anon_id', true))
  );

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
