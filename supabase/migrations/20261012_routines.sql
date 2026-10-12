-- Prayer routines (Settings > Prayer routine): one row per account, holding
-- the list of prayers and the days of the week to pray them.
-- Run this once in the Supabase SQL Editor.

create table if not exists public.prayer_routines (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- [{"key": "daily:morning", "days": [0,1,2,3,4,5,6]}, ...]
  entries jsonb not null default '[]'::jsonb
    check (jsonb_typeof(entries) = 'array' and jsonb_array_length(entries) <= 50),
  updated_at timestamptz not null default now()
);

alter table public.prayer_routines enable row level security;

drop policy if exists "Own routine" on public.prayer_routines;
create policy "Own routine"
  on public.prayer_routines
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.prayer_routines to authenticated;
