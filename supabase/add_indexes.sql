-- ============================================================
-- AdPulse AI — Performance Indexes
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor
--
-- These indexes dramatically speed up RLS policy evaluation
-- and query filtering. Without them, every query does a full
-- table scan to check row-level security policies.
-- ============================================================

-- Campaigns: speed up filtering by user_id (used by RLS policy + client queries)
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns (user_id);

-- Campaigns: speed up ORDER BY updated_at (used by client dashboard)
CREATE INDEX IF NOT EXISTS idx_campaigns_updated_at ON public.campaigns (updated_at DESC);

-- Campaigns: composite index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_campaigns_user_updated ON public.campaigns (user_id, updated_at DESC);

-- Payments: speed up filtering by user_id (used by RLS policy + client queries)
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);

-- Payments: speed up ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments (created_at DESC);

-- Messages: speed up filtering by sender_id (used by RLS policy)
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

-- Messages: speed up filtering by receiver_id (used by RLS policy)
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages (receiver_id);

-- Messages: speed up ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);

-- Profiles: speed up admin role lookups (used by demo seeding + message resolution)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- ============================================================
-- Verify indexes were created
-- ============================================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'campaigns', 'payments', 'messages')
ORDER BY tablename, indexname;
