-- Fragrance notes enrichment table for Chemist feature
-- Stores molecular properties and volatility classification
-- Keyed on note name (e.g. "rose", "oud", "woody")

create table if not exists fragrance_notes (
  name text primary key,
  volatility_class text check (volatility_class in ('top', 'heart', 'base')),
  molecular_weight float,
  xlogp float,
  boiling_point float,
  source text default 'pubchem',
  created_at timestamptz default now()
);

create index on fragrance_notes (volatility_class);
