-- =====================================================
-- Digital Family Directory - Seed Data (Fake/Test)
-- Safe fake data only. No real private info.
-- Run AFTER 001_initial_schema.sql
-- =====================================================

-- NOTE: 
-- - created_by is set to NULL for seed data (demo/historical records).
--   The column is nullable and the FK is only for real admin/member actions.
-- - After you create your first real admin user, you can optionally backfill
--   created_by on these rows if desired.
--
-- IMPORTANT: The first real admin must be promoted manually after signup:
--   UPDATE public.profiles SET role='admin', status='approved' WHERE id = '<your-user-uuid>';

DO $$
DECLARE
  h1_id uuid;
  h2_id uuid;
  p1_id uuid;  -- primary of h1  (Rajesh)
  p2_id uuid;  -- wife of h1     (Sunita)
  p3_id uuid;  -- son of h1      (Amit)
  p4_id uuid;  -- primary of h2  (Kiranbhai)
  p5_id uuid;  -- wife of h2     (Meena)
BEGIN
  -- =====================================================
  -- HOUSEHOLD 1: Sharma Family (Delhi)
  -- =====================================================
  INSERT INTO public.persons (
    id, full_name, gender, date_of_birth, is_deceased,
    education, occupation, marital_status,
    mobile_number, whatsapp_number, email,
    blood_group, notes, visibility_level, status,
    created_by, created_at
  ) VALUES (
    uuid_generate_v4(), 'Rajesh Kumar Sharma', 'male', '1965-03-12', false,
    'B.A.', 'Retired Bank Manager', 'married',
    '+91 98765 43210', '+91 98765 43210', 'rajesh.sharma.test@example.com',
    'O+', 'Family elder, loves gardening', 'members', 'active',
    NULL, now()
  ) RETURNING id INTO p1_id;

  INSERT INTO public.persons (
    id, full_name, gender, date_of_birth, is_deceased,
    education, occupation, marital_status,
    mobile_number, whatsapp_number, email,
    blood_group, notes, visibility_level, status,
    created_by
  ) VALUES (
    uuid_generate_v4(), 'Sunita Devi Sharma', 'female', '1968-07-22', false,
    'Higher Secondary', 'Homemaker', 'married',
    '+91 98765 43211', '+91 98765 43211', NULL,
    'A+', NULL, 'members', 'active',
    NULL
  ) RETURNING id INTO p2_id;

  INSERT INTO public.persons (
    id, full_name, gender, date_of_birth, is_deceased,
    education, occupation, marital_status,
    mobile_number, whatsapp_number, email,
    blood_group, notes, visibility_level, status,
    created_by
  ) VALUES (
    uuid_generate_v4(), 'Amit Sharma', 'male', '1992-11-05', false,
    'B.Tech Computer Science', 'Software Engineer', 'single',
    '+91 98765 43212', '+91 98765 43212', 'amit.sharma.test@example.com',
    'B+', 'Lives in Bangalore currently', 'members', 'active',
    NULL
  ) RETURNING id INTO p3_id;

  INSERT INTO public.households (
    id, household_code, primary_member_name, primary_person_id,
    native_place, residence_address, business_address,
    phone_number, mobile_number, whatsapp_number, email,
    city, state, country, notes, visibility_level, status, verified,
    created_by, created_at
  ) VALUES (
    uuid_generate_v4(), 'HH-DEL-001', 'Rajesh Kumar Sharma', p1_id,
    'Mathura, Uttar Pradesh', '42, Green Park Extension, New Delhi - 110016',
    'N/A (Retired)', '+91-11-26543210', '+91 98765 43210', '+91 98765 43210', 'rajesh.sharma.test@example.com',
    'New Delhi', 'Delhi', 'India',
    'Original family home in Delhi. Annual Diwali gathering here.',
    'members', 'active', true,
    NULL, now()
  ) RETURNING id INTO h1_id;

  -- Link primary (redundant but harmless - we already passed it above)
  UPDATE public.households SET primary_person_id = p1_id WHERE id = h1_id;

  -- household_members
  INSERT INTO public.household_members (household_id, person_id, relationship_to_head, display_order, is_primary) VALUES
    (h1_id, p1_id, 'SELF', 1, true),
    (h1_id, p2_id, 'WIFE', 2, false),
    (h1_id, p3_id, 'SON', 3, false);

  -- Create basic spouse + child relationships
  INSERT INTO public.relationships (person_id, related_person_id, relationship_type, notes, created_by) VALUES
    (p1_id, p2_id, 'spouse', 'Married 1988', NULL),
    (p2_id, p1_id, 'spouse', 'Married 1988', NULL),
    (p1_id, p3_id, 'child', NULL, NULL),
    (p2_id, p3_id, 'child', NULL, NULL);

  -- =====================================================
  -- HOUSEHOLD 2: Patel Family (Ahmedabad)
  -- =====================================================
  INSERT INTO public.persons (
    id, full_name, gender, date_of_birth, is_deceased,
    education, occupation, marital_status,
    mobile_number, whatsapp_number, email,
    blood_group, notes, visibility_level, status,
    created_by
  ) VALUES (
    uuid_generate_v4(), 'Kiranbhai Patel', 'male', '1958-09-01', false,
    'Diploma in Civil Engineering', 'Retired Contractor', 'married',
    '+91 98250 11223', '+91 98250 11223', NULL,
    'B+', 'Community elder, active in local temple', 'members', 'active',
    NULL
  ) RETURNING id INTO p4_id;

  INSERT INTO public.persons (
    id, full_name, gender, date_of_birth, is_deceased,
    education, occupation, marital_status,
    mobile_number, whatsapp_number, email,
    blood_group, notes, visibility_level, status,
    created_by
  ) VALUES (
    uuid_generate_v4(), 'Meena Patel', 'female', '1962-02-14', false,
    'B.A.', 'Teacher (retired)', 'married',
    '+91 98250 11224', '+91 98250 11224', 'meena.patel.test@example.com',
    'O-', NULL, 'members', 'active',
    NULL
  ) RETURNING id INTO p5_id;

  INSERT INTO public.households (
    id, household_code, primary_member_name, primary_person_id,
    native_place, residence_address, business_address,
    phone_number, mobile_number, whatsapp_number, email,
    city, state, country, notes, visibility_level, status, verified,
    created_by
  ) VALUES (
    uuid_generate_v4(), 'HH-AHM-042', 'Kiranbhai Patel', p4_id,
    'Ahmedabad, Gujarat', 'B-17, Shreeji Park Society, Maninagar, Ahmedabad - 380008',
    'Former: Patel Constructions (now closed)', NULL, '+91 98250 11223', '+91 98250 11223', NULL,
    'Ahmedabad', 'Gujarat', 'India',
    'Large joint family originally. Many relatives now in US/UK.',
    'members', 'active', true,
    NULL
  ) RETURNING id INTO h2_id;

  UPDATE public.households SET primary_person_id = p4_id WHERE id = h2_id;

  INSERT INTO public.household_members (household_id, person_id, relationship_to_head, display_order, is_primary) VALUES
    (h2_id, p4_id, 'SELF', 1, true),
    (h2_id, p5_id, 'WIFE', 2, false);

  INSERT INTO public.relationships (person_id, related_person_id, relationship_type, notes, created_by) VALUES
    (p4_id, p5_id, 'spouse', 'Married 1981', NULL),
    (p5_id, p4_id, 'spouse', 'Married 1981', NULL);

  -- Add a few cultural pages (created_by = NULL for seed)
  INSERT INTO public.cultural_pages (title, category, content, language, visibility_level, created_by) VALUES
  (
    'Our Family History',
    'history',
    'The roots of our family trace back to the late 1800s in the villages of Uttar Pradesh and Gujarat. Our ancestors were primarily farmers and traders who valued education, community service, and strong family bonds. Over generations, the family has spread across India and abroad while maintaining close ties through annual gatherings and festivals.',
    'English',
    'public',
    NULL
  ),
  (
    'Mataji''s Guidance',
    'mataji_instructions',
    'Respect elders. Keep the kitchen clean and pure. Always offer food first to guests and family members before eating yourself. Light a diya every evening and remember our ancestors with gratitude.',
    'English',
    'public',
    NULL
  ),
  (
    'Gotra Guidance',
    'gotra_guidance',
    'Our primary gotra is Kashyap. When arranging marriages, please consult elders to ensure gotra compatibility and family records are properly cross-checked.',
    'English',
    'members',
    NULL
  );

  RAISE NOTICE 'Seed data inserted successfully. 2 households + 5 persons + relationships + 3 cultural pages.';
END $$;

-- After running, remember to promote your first real user to admin:
-- UPDATE public.profiles SET role='admin', status='approved' WHERE id = 'PASTE-YOUR-AUTH-USER-UUID-HERE';
