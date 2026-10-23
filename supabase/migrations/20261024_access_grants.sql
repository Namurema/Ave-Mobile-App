-- Free access granted by the Ave team, outside the 7-day trial and paid plans:
-- the people who used Ave before launch, testers, partner parishes...
-- Run this once in the Supabase SQL Editor, after 20261021_payments.sql.
--
-- At launch, end the pre-launch access with:
--   delete from public.access_grants where reason = 'pre-launch';
-- (or give it an end date: update public.access_grants set until = '2026-12-31' where reason = 'pre-launch';)

create table if not exists public.access_grants (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- No end date means until removed
  until timestamptz,
  reason text not null default 'manual' check (char_length(reason) <= 80),
  created_at timestamptz not null default now()
);

-- Only the server and the SQL Editor manage grants
alter table public.access_grants enable row level security;

-- Everyone who has an account today is free until launch
insert into public.access_grants (user_id, reason)
select id, 'pre-launch' from auth.users
on conflict (user_id) do nothing;

-- Trial, paid plan, free access, or the admin
create or replace function public.access_status()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'trial_ends_at', u.created_at + interval '7 days',
    'paid_until', s.current_period_end,
    'plan', s.plan,
    'granted', g.user_id is not null and (g.until is null or g.until > now()),
    'has_access', now() < u.created_at + interval '7 days'
      or coalesce(s.current_period_end > now(), false)
      or (g.user_id is not null and (g.until is null or g.until > now()))
      or public.is_admin()
  )
  from auth.users u
  left join public.subscriptions s on s.user_id = u.id
  left join public.access_grants g on g.user_id = u.id
  where u.id = auth.uid();
$$;

revoke all on function public.access_status() from public, anon;
grant execute on function public.access_status() to authenticated;
