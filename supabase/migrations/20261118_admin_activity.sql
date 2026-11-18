-- Admin: what each account does in Ave (prayers, favourites, routine,
-- reminders, trial and plan). Read by app/admin/index.tsx.
-- Run once in the Supabase SQL Editor. Safe to run again.

create or replace function public.admin_activity()
returns table (
  user_id uuid,
  prayers_total bigint,
  prayers_7d bigint,
  days_active_7d bigint,
  last_prayed_on date,
  favourites bigint,
  routine_prayers integer,
  reminders_on boolean,
  trial_ends_at timestamptz,
  paid_until timestamptz,
  plan text,
  free_until timestamptz,
  free_access boolean,
  payments_completed bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    u.id,
    (select count(*) from public.prayer_log l where l.user_id = u.id),
    (select count(*) from public.prayer_log l where l.user_id = u.id and l.prayed_on > current_date - 7),
    (select count(distinct l.prayed_on) from public.prayer_log l where l.user_id = u.id and l.prayed_on > current_date - 7),
    (select max(l.prayed_on) from public.prayer_log l where l.user_id = u.id),
    (select count(*) from public.favourite_prayers f where f.user_id = u.id),
    coalesce((select jsonb_array_length(r.entries) from public.prayer_routines r where r.user_id = u.id), 0),
    exists (select 1 from public.push_subscriptions p where p.user_id = u.id),
    u.created_at + interval '7 days',
    s.current_period_end,
    s.plan,
    g.until,
    g.user_id is not null and (g.until is null or g.until > now()),
    (select count(*) from public.payments p where p.user_id = u.id and p.status = 'completed')
  from auth.users u
  left join public.subscriptions s on s.user_id = u.id
  left join public.access_grants g on g.user_id = u.id
  -- Only the admin gets rows
  where public.is_admin();
$$;

revoke all on function public.admin_activity() from public, anon;
grant execute on function public.admin_activity() to authenticated;
