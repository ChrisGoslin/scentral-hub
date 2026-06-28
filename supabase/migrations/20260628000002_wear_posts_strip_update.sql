-- Update wear_posts to support The Strip (S1) format
-- Switch from hard auth (user_id UUID) to anon_id (TEXT) to support frictionless sharing
-- Add persona and note fields.

ALTER TABLE wear_posts DROP CONSTRAINT IF EXISTS wear_posts_user_id_fkey;

ALTER TABLE wear_posts 
  ALTER COLUMN user_id TYPE text USING user_id::text,
  RENAME COLUMN user_id TO anon_id;

ALTER TABLE wear_posts
  ADD COLUMN IF NOT EXISTS persona_id text,
  ADD COLUMN IF NOT EXISTS note text;

-- Ensure RLS allows inserts from anon users for The Strip
ALTER TABLE wear_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view wear_posts" ON wear_posts;
CREATE POLICY "Anyone can view wear_posts" ON wear_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon users can insert wear_posts" ON wear_posts;
CREATE POLICY "Anon users can insert wear_posts" ON wear_posts FOR INSERT WITH CHECK (true);

-- Drop unused caption/photo if they exist, to keep schema clean for the new format
ALTER TABLE wear_posts 
  DROP COLUMN IF EXISTS caption,
  DROP COLUMN IF EXISTS wear_photo_url;
