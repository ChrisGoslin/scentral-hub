-- Aura contextual intelligence cache
-- Stores pre-computed advice for fragrances based on weather and context
-- TTL: 24 hours per fragrance per weather state

create table if not exists aura_cache (
  id uuid primary key default gen_random_uuid(),
  fragrance_id text not null,
  context_type text not null check (context_type in ('detail', 'shelf', 'general')),
  weather_state jsonb, -- { temp_c: number, humidity: number } or null for general
  advice_text text not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours'),

  unique(fragrance_id, context_type, weather_state)
);

create index on aura_cache (fragrance_id, context_type);
create index on aura_cache (expires_at) where expires_at > now();

-- Enable RLS
alter table aura_cache enable row level security;

create policy "Public read aura_cache" on aura_cache
  for select to authenticated, anon
  using (true);
