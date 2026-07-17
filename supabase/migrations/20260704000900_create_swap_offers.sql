-- DB-005: Wishlist/Swap schema (approved 2026-07-04). UI is post-launch; schema + RLS land now.
-- Swaps are offers only — no payments ever move through nota. Applied to prod via MCP 2026-07-04.
CREATE TABLE swap_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wants_fragrance_id uuid NOT NULL REFERENCES fragrances(id),
  offers_fragrance_id uuid NOT NULL REFERENCES fragrances(id),
  message text CHECK (char_length(message) <= 280),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT swap_no_self CHECK (from_user <> to_user)
);

CREATE INDEX swap_offers_to_user_idx ON swap_offers (to_user, status);
CREATE INDEX swap_offers_from_user_idx ON swap_offers (from_user, status);

ALTER TABLE swap_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swap participants read" ON swap_offers
  FOR SELECT USING (auth.uid() IN (from_user, to_user));
CREATE POLICY "swap create own" ON swap_offers
  FOR INSERT WITH CHECK (auth.uid() = from_user);
CREATE POLICY "swap respond" ON swap_offers
  FOR UPDATE USING (auth.uid() IN (from_user, to_user));
