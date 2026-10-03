-- Ave: account list for the admin page.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Safe to run again.

-- One row per account, kept in sync with auth.users by the triggers below
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
);

alter table public.profiles enable row level security;

-- The only admin. Counts only once that email address is confirmed, so nobody
-- can become admin by signing up with it first.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and lower(email) = 'namuremabrendah@gmail.com'
      and email_confirmed_at is not null
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Each person can read their own profile; the admin can read all of them.
-- Nobody can write to the table from the app (only the triggers do).
drop policy if exists "Read own profile or admin reads all" on public.profiles;
create policy "Read own profile or admin reads all"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- New account → new profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, created_at, last_sign_in_at, email_confirmed_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.created_at,
    new.last_sign_in_at,
    new.email_confirmed_at
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sign-ins, email confirmation and name changes → profile row
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      full_name = coalesce(new.raw_user_meta_data ->> 'full_name', full_name),
      last_sign_in_at = new.last_sign_in_at,
      email_confirmed_at = new.email_confirmed_at
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_updated();

-- Accounts created before this script
insert into public.profiles (id, email, full_name, created_at, last_sign_in_at, email_confirmed_at)
select id, email, raw_user_meta_data ->> 'full_name', created_at, last_sign_in_at, email_confirmed_at
from auth.users
on conflict (id) do nothing;
