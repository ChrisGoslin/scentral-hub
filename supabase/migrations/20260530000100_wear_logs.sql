-- ============================================================
-- Scentral Hub — Wear Logs & Reflections
-- Track how protocols performed to refine AI future logic.
-- ============================================================

CREATE TABLE IF NOT EXISTS wear_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id  text, -- ID from the Sommelier generation or 'manual'
  rating       int CHECK (rating >= 1 AND rating <= 5),
  compliments  int DEFAULT 0,
  notes        text,
  metadata     jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own logs"
  ON wear_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_wear_logs_user_date ON wear_logs(user_id, created_at DESC);
