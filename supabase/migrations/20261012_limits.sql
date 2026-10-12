-- Limits enforced by the database, matching the app (lib/limits.ts), so they
-- hold even for requests that don't come from the app.
-- Run this once in the Supabase SQL Editor, after 20261004_admin_profiles.sql
-- and 20261007_feedback.sql.

-- Names: one line, at most 60 characters ----------------------------------------
create or replace function public.clean_name(raw text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(left(trim(regexp_replace(coalesce(raw, ''), '\s+', ' ', 'g')), 60), '');
$$;

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
    public.clean_name(new.raw_user_meta_data ->> 'full_name'),
    new.created_at,
    new.last_sign_in_at,
    new.email_confirmed_at
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      full_name = coalesce(public.clean_name(new.raw_user_meta_data ->> 'full_name'), full_name),
      last_sign_in_at = new.last_sign_in_at,
      email_confirmed_at = new.email_confirmed_at
  where id = new.id;
  return new;
end;
$$;

-- Tidy names saved before this script
update public.profiles
set full_name = public.clean_name(full_name)
where full_name is distinct from public.clean_name(full_name);

-- Feedback: stop floods ----------------------------------------------------------
-- At most 5 messages an hour from one account, and 30 every 10 minutes from
-- everyone together (signed-out senders can't be told apart).
create or replace function public.limit_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is not null and (
    select count(*) from public.feedback
    where user_id = new.user_id and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'feedback_rate_limited' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.feedback
    where created_at > now() - interval '10 minutes'
  ) >= 30 then
    raise exception 'feedback_rate_limited' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- Only once the feedback table exists (20261007_feedback.sql). Run this file
-- again after that one if you see the notice below.
do $$
begin
  if to_regclass('public.feedback') is null then
    raise notice 'feedback table not found: run 20261007_feedback.sql, then this file again';
    return;
  end if;
  drop trigger if exists feedback_rate_limit on public.feedback;
  create trigger feedback_rate_limit
    before insert on public.feedback
    for each row execute function public.limit_feedback();
end $$;
