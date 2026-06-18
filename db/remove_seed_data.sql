-- =====================================================
-- REMOVE UNWANTED SEED / TEST DATA
-- Run this in Supabase SQL Editor to clean out the fake
-- Sharma / Patel test records that were previously seeded.
--
-- This targets only the known test entries by email pattern
-- and names. Safe to run multiple times (idempotent).
-- =====================================================

-- Delete relationships involving the test persons first
DELETE FROM public.relationships
WHERE person_id IN (
  SELECT id FROM public.persons 
  WHERE email LIKE '%test@example.com'
     OR full_name IN ('Rajesh Kumar Sharma', 'Sunita Devi Sharma', 'Amit Sharma', 'Kiranbhai Patel', 'Meena Patel')
)
OR related_person_id IN (
  SELECT id FROM public.persons 
  WHERE email LIKE '%test@example.com'
     OR full_name IN ('Rajesh Kumar Sharma', 'Sunita Devi Sharma', 'Amit Sharma', 'Kiranbhai Patel', 'Meena Patel')
);

-- Delete household_members links
DELETE FROM public.household_members
WHERE person_id IN (
  SELECT id FROM public.persons 
  WHERE email LIKE '%test@example.com'
     OR full_name IN ('Rajesh Kumar Sharma', 'Sunita Devi Sharma', 'Amit Sharma', 'Kiranbhai Patel', 'Meena Patel')
);

-- Delete the test households
DELETE FROM public.households
WHERE primary_member_name IN ('Rajesh Kumar Sharma', 'Kiranbhai Patel')
   OR email LIKE '%test@example.com';

-- Delete the test persons
DELETE FROM public.persons
WHERE email LIKE '%test@example.com'
   OR full_name IN ('Rajesh Kumar Sharma', 'Sunita Devi Sharma', 'Amit Sharma', 'Kiranbhai Patel', 'Meena Patel');

-- Optionally remove the demo cultural pages that came with seed
-- (comment out if you want to keep the example cultural content)
DELETE FROM public.cultural_pages
WHERE title IN ('Our Family History', 'Mataji''s Guidance', 'Gotra Guidance')
  AND created_by IS NULL;

-- Verify
SELECT 'Cleanup complete. Remaining households:' as note, count(*) as count FROM public.households;
SELECT 'Remaining persons:' as note, count(*) as count FROM public.persons;
