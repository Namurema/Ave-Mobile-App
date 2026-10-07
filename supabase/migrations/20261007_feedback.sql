-- Feedback sent from the app (Settings > Send feedback).
-- Anyone can send feedback, signed in or not. Only the admin (public.is_admin,
-- see 20261004_admin_profiles.sql) can read it and mark it resolved.
-- Run this once in the Supabase SQL Editor, after 20261004_admin_profiles.sql.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('suggestion', 'translation', 'problem', 'other')),
  message text not null check (char_length(trim(message)) between 1 and 2000),
  email text check (email is null or char_length(email) <= 200),
  language text check (language is null or char_length(language) <= 10),
  resolved boolean not null default false
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- Sending: signed-out people send without a user id; signed-in people can
-- only attach their own. New feedback always starts unresolved.
drop policy if exists "Anyone can send feedback" on public.feedback;
create policy "Anyone can send feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check ((user_id is null or user_id = auth.uid()) and resolved = false);

drop policy if exists "Admin reads feedback" on public.feedback;
create policy "Admin reads feedback"
  on public.feedback
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin updates feedback" on public.feedback;
create policy "Admin updates feedback"
  on public.feedback
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin deletes feedback" on public.feedback;
create policy "Admin deletes feedback"
  on public.feedback
  for delete
  to authenticated
  using (public.is_admin());

grant insert on public.feedback to anon, authenticated;
grant select, update, delete on public.feedback to authenticated;
