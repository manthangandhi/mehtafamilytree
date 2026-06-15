-- =====================================================
-- EMERGENCY FIX: Manually confirm a user's email
-- Use this when a user can't login because of "Email not confirmed"
--
-- IMPORTANT:
-- 1. Replace 'the-user-email@example.com' with the actual email.
-- 2. Run this in Supabase SQL Editor (it uses service role privileges).
-- 3. Then also make sure their profiles.status is 'approved'.
-- =====================================================

-- The CORRECT way (only touch email_confirmed_at)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'the-user-email@example.com';

-- Optional: also ensure the profile status is approved
-- (replace the email or use the id)
UPDATE public.profiles
SET status = 'approved'
WHERE email = 'the-user-email@example.com';

-- Verify
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.status as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'the-user-email@example.com';

-- =====================================================
-- ALTERNATIVE: If you know the user ID (from profiles table)
-- =====================================================
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'uuid-here';
