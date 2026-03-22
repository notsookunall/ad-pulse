-- ============================================================
-- AdPulse AI — Seed Data
-- Run this AFTER schema.sql, and AFTER creating users via Supabase Auth
-- ============================================================
-- 
-- IMPORTANT: Before running this script, create these users in
-- Supabase Auth (Authentication > Users > Add User):
-- 
-- 1. Admin user:
--    Email: admin@adpulse.ai
--    Password: Admin@123
-- 
-- 2. Demo client:
--    Email: demo@company.com
--    Password: Demo@123
--
-- After creating the users, copy their UUIDs from the Supabase
-- Auth dashboard and replace the placeholders below.
-- ============================================================

-- Replace these with real UUIDs from Supabase Auth dashboard
-- You'll get these after creating the users in Auth > Users
DO $$
DECLARE
  admin_id uuid;
  client_id uuid;
BEGIN
  -- Get user IDs from auth.users (they should already exist from signup)
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@adpulse.ai' LIMIT 1;
  SELECT id INTO client_id FROM auth.users WHERE email = 'kunal.23SCSE1040212@galgotiasuniversity.ac.in' LIMIT 1;

  -- Update profiles to set admin role
  UPDATE public.profiles SET role = 'admin', full_name = 'Admin User', company = 'AdPulse AI' WHERE id = admin_id;
  UPDATE public.profiles SET full_name = 'Alex Johnson', company = 'TechCorp Inc.' WHERE id = client_id;

  -- Insert sample campaigns for the demo client
  INSERT INTO public.campaigns (user_id, name, platform, status, budget, spent, impressions, clicks, conversions, start_date, end_date) VALUES
    (client_id, 'Summer Sale 2025', 'google', 'running', 5000, 2340, 45200, 1230, 89, '2025-06-01', '2025-08-31'),
    (client_id, 'New Product Launch', 'facebook', 'pending', 12000, 0, 0, 0, 0, '2025-07-15', '2025-09-15'),
    (client_id, 'Retargeting Q3', 'instagram', 'completed', 3500, 3200, 28900, 890, 67, '2025-07-01', '2025-09-30'),
    (client_id, 'Brand Awareness', 'linkedin', 'running', 8000, 4500, 62000, 1800, 120, '2025-05-01', '2025-12-31'),
    (client_id, 'Holiday Special', 'google', 'draft', 15000, 0, 0, 0, 0, '2025-11-01', '2025-12-31'),
    (client_id, 'Social Media Push', 'twitter', 'paused', 2500, 1100, 18500, 420, 28, '2025-06-15', '2025-08-15');

  -- Insert sample payments for the demo client
  INSERT INTO public.payments (user_id, amount, status, method, description) VALUES
    (client_id, 5000, 'completed', 'razorpay', 'Summer Sale 2025 — Campaign Budget'),
    (client_id, 12000, 'pending', 'razorpay', 'New Product Launch — Campaign Budget'),
    (client_id, 3500, 'completed', 'upi', 'Retargeting Q3 — Campaign Budget'),
    (client_id, 8000, 'completed', 'bank_transfer', 'Brand Awareness — Campaign Budget'),
    (client_id, 2500, 'failed', 'razorpay', 'Social Media Push — Payment Failed');

  -- Insert sample messages
  INSERT INTO public.messages (sender_id, receiver_id, subject, body, is_read) VALUES
    (client_id, admin_id, 'Campaign Performance Query', 'Hi, I would like to know the latest performance metrics for my Summer Sale campaign. Could you share the CTR and conversion trends?', false),
    (admin_id, client_id, 'Welcome to AdPulse AI!', 'Welcome aboard, Alex! Your account has been set up. Feel free to create your first campaign from the dashboard. Let us know if you need any help.', true),
    (admin_id, client_id, 'Campaign Approved', 'Your "Brand Awareness" campaign has been reviewed and approved. It is now live across LinkedIn. You can track real-time metrics from your analytics dashboard.', true),
    (client_id, admin_id, 'Payment Issue', 'My payment for the Social Media Push campaign failed. Could you help me resolve this? I tried using Razorpay but it showed an error.', false);

END $$;
