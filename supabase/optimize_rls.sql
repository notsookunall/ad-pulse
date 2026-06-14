-- ============================================================
-- AdPulse AI — Optimized RLS Policies
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor
--
-- The original RLS policies used (auth.jwt() ->> 'email') = 'admin@adpulse.ai'
-- to check for admin access. This is SLOW because:
--   1. It parses the JWT token on every row evaluation
--   2. It does a string comparison on every row
--
-- This script replaces that pattern with a fast subquery that
-- looks up the role from the profiles table using auth.uid(),
-- which is already indexed (primary key lookup).
-- ============================================================

BEGIN;

-- ============================================================
-- Helper function: check if current user is admin (fast PK lookup)
-- This avoids parsing JWT on every row and uses the indexed PK instead.
-- SECURITY DEFINER lets this function bypass RLS to avoid recursion.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES policies (re-create with optimized admin check)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view admin profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can view admin profile"
  ON public.profiles FOR SELECT
  USING (role = 'admin');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- CAMPAIGNS policies
-- ============================================================
DROP POLICY IF EXISTS "Clients can view own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Clients can insert own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns for clients" ON public.campaigns;
DROP POLICY IF EXISTS "Clients can update own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can update all campaigns" ON public.campaigns;

CREATE POLICY "Clients can view own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Clients can insert own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert campaigns for clients"
  ON public.campaigns FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can update own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all campaigns"
  ON public.campaigns FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- PAYMENTS policies
-- ============================================================
DROP POLICY IF EXISTS "Clients can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Clients can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;

CREATE POLICY "Clients can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Clients can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all payments"
  ON public.payments FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- MESSAGES policies
-- ============================================================
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Receivers can mark messages as read" ON public.messages;

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can mark messages as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

COMMIT;

-- ============================================================
-- Verify everything is set up correctly
-- ============================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'campaigns', 'payments', 'messages')
ORDER BY tablename, policyname;
