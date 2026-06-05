-- Drop old spritz_schedules if it exists (incompatible shape from pre-MVP)
DROP TABLE IF EXISTS spritz_schedules CASCADE;

-- Spritz Schedules v2 — simple 3-slot day plan
CREATE TABLE spritz_schedules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  name         text NOT NULL DEFAULT 'My Schedule',
  occasion     text,
  morning_fragrance_id   uuid REFERENCES fragrances(id) ON DELETE SET NULL,
  midday_fragrance_id    uuid REFERENCES fragrances(id) ON DELETE SET NULL,
  evening_fragrance_id   uuid REFERENCES fragrances(id) ON DELETE SET NULL,
  morning_sprays   int,
  midday_sprays    int,
  evening_sprays   int
);

ALTER TABLE spritz_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ss_select_own" ON spritz_schedules
  FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "ss_insert_own" ON spritz_schedules
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "ss_update_own" ON spritz_schedules
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "ss_delete_own" ON spritz_schedules
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX ss_user_created_idx ON spritz_schedules(user_id, created_at DESC);
