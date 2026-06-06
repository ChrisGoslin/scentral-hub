create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  archetype text not null check (archetype in ('collector', 'experimenter', 'minimalist', 'architect')),
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_idx on waitlist (lower(email));

alter table waitlist enable row level security;

-- No public select; inserts allowed without auth for the waitlist signup
create policy "Allow public insert" on waitlist
  for insert with check (true);
