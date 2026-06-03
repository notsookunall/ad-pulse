-- ============================================================
-- AdPulse AI - Supabase RLS Security Fix
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor if Advisor reports:
-- "Policy Exists RLS Disabled" or "Table publicly accessible".
--
-- This enables Row Level Security on the app tables and adds the
-- policies needed by the client/admin dashboards.
-- ============================================================

begin;

-- 1. Enable Row Level Security on every public app table.
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;

-- 2. Profiles policies.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can view admin profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Enable insert for authenticated users" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

create policy "Users can view admin profile"
  on public.profiles for select
  using (role = 'admin');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

create policy "Enable insert for authenticated users"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Campaign policies.
drop policy if exists "Clients can view own campaigns" on public.campaigns;
drop policy if exists "Admins can view all campaigns" on public.campaigns;
drop policy if exists "Clients can insert own campaigns" on public.campaigns;
drop policy if exists "Admins can insert campaigns for clients" on public.campaigns;
drop policy if exists "Clients can update own campaigns" on public.campaigns;
drop policy if exists "Admins can update all campaigns" on public.campaigns;

create policy "Clients can view own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Admins can view all campaigns"
  on public.campaigns for select
  using ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

create policy "Clients can insert own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Admins can insert campaigns for clients"
  on public.campaigns for insert
  with check ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

create policy "Clients can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Admins can update all campaigns"
  on public.campaigns for update
  using ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

-- 4. Payment policies.
drop policy if exists "Clients can view own payments" on public.payments;
drop policy if exists "Admins can view all payments" on public.payments;
drop policy if exists "Clients can insert own payments" on public.payments;
drop policy if exists "Admins can update all payments" on public.payments;

create policy "Clients can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Admins can view all payments"
  on public.payments for select
  using ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

create policy "Clients can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

create policy "Admins can update all payments"
  on public.payments for update
  using ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

-- 5. Message policies.
drop policy if exists "Users can view own messages" on public.messages;
drop policy if exists "Admins can view all messages" on public.messages;
drop policy if exists "Users can send messages" on public.messages;
drop policy if exists "Receivers can mark messages as read" on public.messages;

create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Admins can view all messages"
  on public.messages for select
  using ((auth.jwt() ->> 'email') = 'admin@adpulse.ai');

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Receivers can mark messages as read"
  on public.messages for update
  using (auth.uid() = receiver_id);

commit;

-- Optional verification query. Run this after the transaction above.
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'campaigns', 'payments', 'messages')
order by tablename;
