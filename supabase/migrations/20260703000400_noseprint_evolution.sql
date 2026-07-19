-- Epic 14: Noseprint Evolution — weekly identity drift detection
-- Detect family shifts and descriptor pattern changes, surface evolution moments to user

-- Table: evolution_events
-- Tracks each detected identity shift and user's response
CREATE TABLE IF NOT EXISTS evolution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id text NOT NULL,
  old_identity text NOT NULL, -- e.g., "solar_minimalist"
  new_identity text NOT NULL, -- e.g., "dark_alchemist"
  shift_type text NOT NULL, -- 'descriptor_drift', 'family_shift', 'blind_ranking'
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100), -- 0-100
  user_choice text, -- NULL (not yet answered), 'stay', 'evolve', 'keep_both'
  status text NOT NULL DEFAULT 'active', -- 'active', 'previous', 'kept'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT valid_shift_type CHECK (shift_type IN ('descriptor_drift', 'family_shift', 'blind_ranking')),
  CONSTRAINT valid_user_choice CHECK (user_choice IS NULL OR user_choice IN ('stay', 'evolve', 'keep_both')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'previous', 'kept'))
);

CREATE INDEX IF NOT EXISTS idx_evolution_events_anon_id ON evolution_events(anon_id);
CREATE INDEX IF NOT EXISTS idx_evolution_events_status ON evolution_events(status);
CREATE INDEX IF NOT EXISTS idx_evolution_events_created_at ON evolution_events(created_at DESC);

-- Table: noseprint_history
-- Versioned snapshots of user's detected identity + confidence
CREATE TABLE IF NOT EXISTS noseprint_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id text NOT NULL,
  version integer NOT NULL, -- 1-indexed, increments on each detected shift
  identity_json jsonb NOT NULL, -- { persona_id, confidence, detected_at, reason }
  status text NOT NULL DEFAULT 'current', -- 'current', 'previous', 'kept'
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT valid_noseprint_status CHECK (status IN ('current', 'previous', 'kept')),
  UNIQUE(anon_id, version)
);

CREATE INDEX IF NOT EXISTS idx_noseprint_history_anon_id ON noseprint_history(anon_id);
CREATE INDEX IF NOT EXISTS idx_noseprint_history_status ON noseprint_history(status);
CREATE INDEX IF NOT EXISTS idx_noseprint_history_version ON noseprint_history(version DESC);

-- Enable RLS on both tables
ALTER TABLE evolution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE noseprint_history ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can see their own evolution events
--
-- This file was re-versioned — on a database where the former
-- 20260703_noseprint_evolution.sql already created these tables/indexes/
-- policies, the CREATE TABLE/INDEX IF NOT EXISTS above safely no-op, but
-- a bare CREATE POLICY with the same name aborts on the first one.
-- DROP POLICY IF EXISTS before each.
DROP POLICY IF EXISTS evolution_events_select ON evolution_events;
CREATE POLICY evolution_events_select ON evolution_events
  FOR SELECT USING (anon_id = current_setting('app.current_anon_id', true));

DROP POLICY IF EXISTS evolution_events_insert ON evolution_events;
CREATE POLICY evolution_events_insert ON evolution_events
  FOR INSERT WITH CHECK (anon_id = current_setting('app.current_anon_id', true));

DROP POLICY IF EXISTS evolution_events_update ON evolution_events;
CREATE POLICY evolution_events_update ON evolution_events
  FOR UPDATE USING (anon_id = current_setting('app.current_anon_id', true));

DROP POLICY IF EXISTS noseprint_history_select ON noseprint_history;
CREATE POLICY noseprint_history_select ON noseprint_history
  FOR SELECT USING (anon_id = current_setting('app.current_anon_id', true));

DROP POLICY IF EXISTS noseprint_history_insert ON noseprint_history;
CREATE POLICY noseprint_history_insert ON noseprint_history
  FOR INSERT WITH CHECK (anon_id = current_setting('app.current_anon_id', true));
