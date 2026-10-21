-- Subscriptions paid through PesaPal, and the 7-day free trial.
-- Run this once in the Supabase SQL Editor.
--
-- Only the payment functions (supabase/functions/pesapal-*, which use the
-- service role) write to these tables. The app can only read its own rows,
-- so nobody can mark themselves as paid from their phone.

-- One row per payment attempt
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Our reference, sent to PesaPal as the order id
  merchant_reference text not null unique,
  -- PesaPal's reference for the order
  order_tracking_id text unique,
  plan text not null check (plan in ('monthly', 'yearly')),
  currency text not null check (currency in ('UGX', 'USD')),
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'invalid', 'reversed')),
  payment_method text,
  confirmation_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Set when this payment extended the subscription, so it only counts once
  applied_at timestamptz
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

-- One row per paying account: paid up to this moment
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text check (plan in ('monthly', 'yearly')),
  current_period_end timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Read own payments" on public.payments;
create policy "Read own payments"
  on public.payments for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Read own subscription" on public.subscriptions;
create policy "Read own subscription"
  on public.subscriptions for select to authenticated
  using (user_id = auth.uid());

grant select on public.payments, public.subscriptions to authenticated;

-- What the app asks: when the free trial ends, until when the account is
-- paid, and whether it can use Ave right now
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
    'has_access', now() < u.created_at + interval '7 days'
      or coalesce(s.current_period_end > now(), false)
  )
  from auth.users u
  left join public.subscriptions s on s.user_id = u.id
  where u.id = auth.uid();
$$;

revoke all on function public.access_status() from public, anon;
grant execute on function public.access_status() to authenticated;

-- Adds a month or a year for a completed payment, exactly once (PesaPal may
-- confirm the same payment several times). Paying early adds to the current
-- period; paying after it ended starts from now.
create or replace function public.apply_payment(p_reference text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  pay public.payments;
  base timestamptz;
begin
  select * into pay from public.payments where merchant_reference = p_reference for update;
  if not found or pay.status <> 'completed' or pay.applied_at is not null then
    return;
  end if;

  select greatest(coalesce(max(current_period_end), now()), now()) into base
  from public.subscriptions where user_id = pay.user_id;

  insert into public.subscriptions (user_id, plan, current_period_end, updated_at)
  values (
    pay.user_id,
    pay.plan,
    base + case pay.plan when 'yearly' then interval '1 year' else interval '1 month' end,
    now()
  )
  on conflict (user_id) do update
    set plan = excluded.plan, current_period_end = excluded.current_period_end, updated_at = now();

  update public.payments set applied_at = now() where id = pay.id;
end;
$$;

revoke all on function public.apply_payment(text) from public, anon, authenticated;
grant execute on function public.apply_payment(text) to service_role;
