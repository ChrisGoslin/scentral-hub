-- Add affinity_score to collections for Living Wardrobe tier placement.
-- Nullable integer: null/0 → Holding Zone, 1-7 → Base Anchors,
-- 8-15 → Occasion Modifiers, 16-20 → Signatures.
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS affinity_score integer;
