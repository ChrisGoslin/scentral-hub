-- Migration: 20260611_sommelier_cache
-- Caches strategic intelligence audits for wardrobes

CREATE TABLE IF NOT EXISTS sommelier_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sommelier_mode ON sommelier_cache (mode);
