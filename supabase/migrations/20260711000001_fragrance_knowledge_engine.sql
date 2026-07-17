-- Fragrance & Layering Knowledge Engine — canonical facts extracted from
-- ingested source docs (data/fragrance/incoming -> canonical), enriched via
-- LLM into notes/accords/roles for NotebookLM export. Not the live catalogue
-- (`fragrances`, 127k rows) — this is curated knowledge-pipeline output.

CREATE TABLE IF NOT EXISTS public.fragrance_facts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fragrance_id uuid REFERENCES public.fragrances ON DELETE SET NULL,
  brand text,
  name text NOT NULL,
  source_file text NOT NULL,
  top_notes text[] DEFAULT '{}',
  heart_notes text[] DEFAULT '{}',
  base_notes text[] DEFAULT '{}',
  accord_families text[] DEFAULT '{}',
  role text CHECK (role IN ('anchor', 'modulator', 'top')),
  raw_text text NOT NULL,
  enriched jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Expression index (not a plain UNIQUE constraint) so a NULL brand doesn't
-- let the same (source_file, name) repeat — Postgres treats NULLs as
-- distinct in a regular UNIQUE constraint, COALESCE closes that gap.
CREATE UNIQUE INDEX fragrance_facts_source_brand_name_unique
  ON public.fragrance_facts (source_file, COALESCE(brand, ''), name);

CREATE INDEX idx_fragrance_facts_brand_name ON public.fragrance_facts(brand, name);
CREATE INDEX idx_fragrance_facts_role ON public.fragrance_facts(role);
CREATE INDEX idx_fragrance_facts_source_file ON public.fragrance_facts(source_file);

ALTER TABLE public.fragrance_facts ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: this table is written and read only via
-- the service-role key (ingest/export scripts). Deny-by-default is correct.

CREATE TABLE IF NOT EXISTS public.layering_patterns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name text NOT NULL,
  source_file text NOT NULL,
  fragrance_names text[] NOT NULL DEFAULT '{}',
  roles text[] NOT NULL DEFAULT '{}' CHECK (
    roles <@ ARRAY['anchor', 'modulator', 'top']::text[]
    AND (
      roles = '{}'::text[]
      OR array_length(roles, 1) = array_length(fragrance_names, 1)
    )
  ), -- parallel array to fragrance_names: anchor/modulator/top
  use_case text,
  rationale text,
  raw_text text NOT NULL,
  enriched jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT layering_patterns_source_pattern_unique UNIQUE (source_file, pattern_name)
);

CREATE INDEX idx_layering_patterns_source_file ON public.layering_patterns(source_file);
CREATE INDEX idx_layering_patterns_use_case ON public.layering_patterns(use_case);

ALTER TABLE public.layering_patterns ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: service-role only, same rationale as above.
