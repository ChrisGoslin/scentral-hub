-- Weekly Scent Challenge Feature — User engagement via challenge participation

-- 1. weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  is_active boolean DEFAULT false,
  participant_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for weekly_challenges — public read-only
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON public.weekly_challenges FOR SELECT
  USING (true);

-- Indexes for performance
CREATE INDEX idx_weekly_challenges_week_start ON public.weekly_challenges(week_start);
CREATE INDEX idx_weekly_challenges_is_active ON public.weekly_challenges(is_active);
CREATE INDEX idx_weekly_challenges_created_at ON public.weekly_challenges(created_at DESC);

-- Seed initial challenges
INSERT INTO public.weekly_challenges (week_start, title, description, category, is_active, participant_count)
VALUES
  ('2026-07-01'::date, 'Citrus Week', 'Wear something citrus-forward every day this week', 'Exploration', true, 0),
  ('2026-07-01'::date, 'Office Safe Challenge', 'Find your perfect professional scent', 'Work', false, 0),
  ('2026-07-01'::date, 'Clone vs Original', 'Wear an inspired-by fragrance and compare it to the original', 'Discovery', false, 0),
  ('2026-07-01'::date, 'New Discovery', 'Wear something from your collection you haven''t tried in 30+ days', 'Collection', false, 0);
