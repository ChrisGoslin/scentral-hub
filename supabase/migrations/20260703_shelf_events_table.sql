-- Epic 13: Insights Dashboard — Shelf event log for taste evolution tracking

CREATE TABLE public.shelf_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id text NOT NULL REFERENCES public.profiles(anon_id) ON DELETE CASCADE,
  fragrance_id uuid NOT NULL REFERENCES public.fragrances(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('add', 'remove', 'reorder')),
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for shelf_events
ALTER TABLE public.shelf_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shelf events"
  ON public.shelf_events FOR SELECT
  USING (anon_id = current_setting('app.current_anon_id', true));

CREATE POLICY "Users can create shelf events"
  ON public.shelf_events FOR INSERT
  WITH CHECK (anon_id = current_setting('app.current_anon_id', true));

-- Indexes for performance
CREATE INDEX idx_shelf_events_anon_id ON public.shelf_events(anon_id);
CREATE INDEX idx_shelf_events_fragrance_id ON public.shelf_events(fragrance_id);
CREATE INDEX idx_shelf_events_created_at ON public.shelf_events(created_at DESC);
CREATE INDEX idx_shelf_events_event_type ON public.shelf_events(event_type);
