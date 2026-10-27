-- For You cards the admin has hidden (the Hide button on a card, admin only).
-- Run once in the Supabase SQL Editor. Safe to run again.

create table if not exists public.foryou_hidden (
  id text primary key check (char_length(id) <= 120),
  hidden_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.foryou_hidden enable row level security;

-- Everyone's app needs to know which cards to leave out
drop policy if exists "Read hidden cards" on public.foryou_hidden;
create policy "Read hidden cards"
  on public.foryou_hidden
  for select
  to anon, authenticated
  using (true);

-- Only the admin hides and shows cards
drop policy if exists "Admin hides cards" on public.foryou_hidden;
create policy "Admin hides cards"
  on public.foryou_hidden
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin shows cards" on public.foryou_hidden;
create policy "Admin shows cards"
  on public.foryou_hidden
  for delete
  to authenticated
  using (public.is_admin());
