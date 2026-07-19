-- Aura contextual intelligence cache
-- Stores pre-computed advice for fragrances based on weather and context
-- TTL: 24 hours per fragrance per weather state

create table if not exists aura_cache (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null references fragrances(id) on delete cascade,
  context_type text not null check (context_type in ('detail', 'shelf', 'general', 'post_wear')),
  weather_state jsonb, -- { temp_c: number, humidity: number } or null for general
  advice_text text not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours'),

  unique(fragrance_id, context_type, weather_state)
);

-- This file was re-versioned — on a database where the former
-- 20260703_aura_cache_table.sql already ran, CREATE TABLE IF NOT EXISTS
-- safely reuses the table, but these unnamed indexes and the policy
-- already exist under Postgres's generated names / the same policy name,
-- and bare re-creation aborts. Named explicitly + IF NOT EXISTS /
-- DROP POLICY IF EXISTS first.
create index if not exists idx_aura_cache_fragrance_context on aura_cache (fragrance_id, context_type);
create index if not exists idx_aura_cache_expires_at on aura_cache (expires_at);

-- Enable RLS
alter table aura_cache enable row level security;

drop policy if exists "Public read aura_cache" on aura_cache;
create policy "Public read aura_cache" on aura_cache
  for select to authenticated, anon
  using (true);
