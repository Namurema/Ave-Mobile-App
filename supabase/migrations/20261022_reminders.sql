-- Prayer reminders: phones that turned reminders on (web push), and a log so
-- each routine prayer is reminded at most once a day.
-- Run this once in the Supabase SQL Editor, after 20261012_routines.sql.
-- The every-5-minutes schedule is set up separately (scripts/reminders-setup.mjs).

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- From the browser's PushManager; unique per phone and browser
  endpoint text not null unique check (char_length(endpoint) <= 1000),
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  -- The phone's time zone, e.g. "Africa/Kampala", so reminders follow local time
  timezone text not null default 'Africa/Kampala' check (char_length(timezone) <= 64),
  -- Reminder heading in the person's language, e.g. "Time to pray"
  heading text not null default 'Time to pray' check (char_length(heading) <= 80),
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Each person manages only their own phones
drop policy if exists "Own push subscriptions" on public.push_subscriptions;
create policy "Own push subscriptions"
  on public.push_subscriptions
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- Written only by the reminder sender (service role)
create table if not exists public.reminders_sent (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  -- The person's local date
  sent_on date not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, item_key, sent_on)
);

alter table public.reminders_sent enable row level security;
