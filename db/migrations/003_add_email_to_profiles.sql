-- =====================================================
-- Migration: Add email column to profiles (for convenience)
-- Run this on your EXISTING Supabase project if you already ran 001.
-- This makes the email visible in the admin users table.
-- =====================================================

-- 1. Add the column (nullable so existing rows are fine)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;

-- 2. Backfill email from auth.users for any existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- 3. Update the trigger so new registrations automatically store email + mobile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mobile_number, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'mobile_number',
    'member',
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Note: The trigger "on_auth_user_created" should already exist from 001.
-- If you need to recreate it:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON COLUMN public.profiles.email IS 'Denormalized from auth.users for easier display in admin UI. Source of truth remains auth.users.';

-- After running this, new registrations will have email in profiles.
-- You can now use the "Confirm Email" button in /admin/users (it uses the proper Supabase Admin API
-- instead of raw SQL on auth.users). This is the recommended way going forward.
