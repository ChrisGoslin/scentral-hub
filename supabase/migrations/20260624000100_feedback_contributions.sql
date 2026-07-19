-- Feedback & Contributions system — floating widget on every page lets users
-- submit bugs/ideas/suggestions; admin triages via /admin/feedback and awards XP.
--
-- This file was re-versioned — on a database where the former
-- 20260624_feedback_contributions.sql already applied, the table already
-- exists. Guarded on the table not already existing (CREATE POLICY has no
-- IF NOT EXISTS form, so the whole body is wrapped in one DO block)
-- instead of aborting with "relation already exists".

DO $$
BEGIN
  IF to_regclass('public.feedback') IS NOT NULL THEN
    RETURN;
  END IF;

  CREATE TABLE public.feedback (
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

  ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);
  CREATE POLICY "Anyone can read own feedback" ON public.feedback FOR SELECT USING (true);
END
$$;
