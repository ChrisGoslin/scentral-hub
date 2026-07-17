-- Epic 13: Insights Dashboard — Reaction tracking for traces and content

CREATE TABLE public.trace_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trace_id text NOT NULL,
  anon_id text NOT NULL REFERENCES public.profiles(anon_id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('felt', 'noted', 'saved')),
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for trace_reactions
ALTER TABLE public.trace_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions"
  ON public.trace_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reactions"
  ON public.trace_reactions FOR INSERT
  WITH CHECK (anon_id = current_setting('app.current_anon_id', true));

CREATE POLICY "Users can delete their own reactions"
  ON public.trace_reactions FOR DELETE
  USING (anon_id = current_setting('app.current_anon_id', true));

-- Indexes for performance
CREATE INDEX idx_trace_reactions_trace_id ON public.trace_reactions(trace_id);
CREATE INDEX idx_trace_reactions_anon_id ON public.trace_reactions(anon_id);
CREATE INDEX idx_trace_reactions_created_at ON public.trace_reactions(created_at DESC);
CREATE UNIQUE INDEX idx_trace_reactions_unique_reaction ON public.trace_reactions(trace_id, anon_id, reaction_type);
