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

-- This file was re-versioned — on a database where the former
-- 20260624_fragrance_notes_table.sql already ran, CREATE TABLE IF NOT
-- EXISTS safely reuses the table, but an unnamed index already exists
-- under Postgres's generated name and a bare CREATE INDEX with the same
-- generated name aborts. Named explicitly + IF NOT EXISTS.
create index if not exists idx_fragrance_notes_volatility_class on fragrance_notes (volatility_class);
