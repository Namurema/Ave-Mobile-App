-- Ave: prayer progress and favourites for signed-in users.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Safe to run again.
--
-- Items are identified by a key such as "daily:morning", "novena:2",
-- "chaplet:1", "other:magnificat", "stations" or "rosary" (see lib/items.ts).

-- One row per prayer prayed per day
create table if not exists public.prayer_log (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_key text not null,
  prayed_on date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_key, prayed_on)
);

-- Saved prayers
create table if not exists public.favourite_prayers (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

alter table public.prayer_log enable row level security;
alter table public.favourite_prayers enable row level security;

-- Each person can only see and change their own rows
drop policy if exists "Own prayer log" on public.prayer_log;
create policy "Own prayer log"
  on public.prayer_log
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Own favourites" on public.favourite_prayers;
create policy "Own favourites"
  on public.favourite_prayers
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
