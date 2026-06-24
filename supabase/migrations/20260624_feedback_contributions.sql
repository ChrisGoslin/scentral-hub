-- Feedback & Contributions system — floating widget on every page lets users
-- submit bugs/ideas/suggestions; admin triages via /admin/feedback and awards XP.
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  type text CHECK (type IN ('bug', 'enhancement', 'suggestion')),
  title text NOT NULL,
  body text,
  url text,
  status text DEFAULT 'in_review' CHECK (status IN ('in_review', 'building', 'captured')),
  xp_awarded integer DEFAULT 0,
  admin_note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own feedback" ON feedback FOR SELECT USING (true);
