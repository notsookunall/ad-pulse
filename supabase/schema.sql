-- ============================================================
-- AdPulse AI — Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ============================================================

-- 1. PROFILES TABLE (extends Supabase auth.users)
-- We use a separate "profiles" table rather than modifying auth.users directly
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'client' check (role in ('admin', 'client')),
  company text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. CAMPAIGNS TABLE
create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  platform text not null default 'google' check (platform in ('google', 'facebook', 'instagram', 'linkedin', 'twitter')),
  status text not null default 'draft' check (status in ('draft', 'pending', 'running', 'paused', 'completed')),
  budget numeric(12, 2) default 0,
  spent numeric(12, 2) default 0,
  impressions integer default 0,
  clicks integer default 0,
  conversions integer default 0,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  method text not null default 'razorpay' check (method in ('razorpay', 'bank_transfer', 'upi')),
  razorpay_payment_id text,
  razorpay_order_id text,
  description text,
  created_at timestamptz default now()
);

-- 4. MESSAGES TABLE
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  body text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Enable insert for authenticated users"
  on public.profiles for insert
  with check (auth.uid() = id);

-- CAMPAIGNS policies
create policy "Clients can view own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Admins can view all campaigns"
  on public.campaigns for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Clients can insert own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Clients can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Admins can update all campaigns"
  on public.campaigns for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- PAYMENTS policies
create policy "Clients can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Admins can view all payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Clients can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- MESSAGES policies
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Receivers can mark messages as read"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- ============================================================
-- AUTO-UPDATE TRIGGER for updated_at
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_campaigns
  before update on public.campaigns
  for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- This trigger creates a profile row when a user signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
