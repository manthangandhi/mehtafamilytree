-- =====================================================
-- Digital Family Directory - Initial Schema
-- CORRECTED VERSION - Proper creation order
--
-- IMPORTANT: Run this ENTIRE script in Supabase SQL Editor.
-- Table creation order matters for foreign keys and functions.
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. SAFE HELPER FUNCTION (no table dependencies)
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. CREATE TABLES (in dependency order)
--    Persons before Households because of FK
-- =====================================================

-- 2.1 PROFILES (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  mobile_number text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2 PERSONS
CREATE TABLE public.persons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth date,
  date_of_death date,
  is_deceased boolean NOT NULL DEFAULT false,
  education text,
  occupation text,
  marital_status text,
  mobile_number text,
  whatsapp_number text,
  email text,
  blood_group text,
  notes text,
  visibility_level text NOT NULL DEFAULT 'members' CHECK (visibility_level IN ('public', 'members', 'admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.3 HOUSEHOLDS (can now safely reference persons)
CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_code text UNIQUE,
  primary_member_name text NOT NULL,
  primary_person_id uuid REFERENCES public.persons(id),
  native_place text,
  residence_address text,
  business_address text,
  phone_number text,
  mobile_number text,
  whatsapp_number text,
  email text,
  city text,
  state text,
  country text NOT NULL DEFAULT 'India',
  notes text,
  visibility_level text NOT NULL DEFAULT 'members' CHECK (visibility_level IN ('public', 'members', 'admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  verified boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.4 HOUSEHOLD_MEMBERS
CREATE TABLE public.household_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  relationship_to_head text NOT NULL CHECK (
    relationship_to_head IN (
      'SELF', 'FATHER', 'MOTHER', 'WIFE', 'HUSBAND',
      'SON', 'DAUGHTER', 'DAUGHTER IN LAW', 'SON IN LAW',
      'GRAND SON', 'GRAND DAUGHTER', 'BROTHER', 'SISTER', 'OTHER'
    )
  ),
  display_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, person_id)
);

-- 2.5 RELATIONSHIPS (person-to-person)
CREATE TABLE public.relationships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  related_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (
    relationship_type IN ('father', 'mother', 'spouse', 'child', 'sibling', 'guardian', 'other')
  ),
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (person_id <> related_person_id)
);

-- 2.6 CHANGE_REQUESTS
CREATE TABLE public.change_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type text NOT NULL CHECK (
    request_type IN (
      'add_household',
      'update_household',
      'delete_household',
      'add_person',
      'update_person',
      'mark_deceased',
      'add_household_member',
      'update_household_member',
      'remove_household_member',
      'add_relationship',
      'update_relationship',
      'delete_relationship'
    )
  ),
  target_table text NOT NULL,
  target_record_id uuid,
  submitted_by uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proposed_data jsonb NOT NULL,
  current_data jsonb,
  admin_notes text,
  rejection_reason text,
  reviewed_by uuid REFERENCES public.profiles(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- 2.7 AUDIT_LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid REFERENCES public.profiles(id),
  performed_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- 2.8 CULTURAL_PAGES
CREATE TABLE public.cultural_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  category text NOT NULL CHECK (
    category IN (
      'history', 'mataji_instructions', 'bhabha_history',
      'gotra_guidance', 'ritual_procedure', 'special_note', 'general'
    )
  ),
  content text NOT NULL,
  language text NOT NULL DEFAULT 'English',
  visibility_level text NOT NULL DEFAULT 'public' CHECK (visibility_level IN ('public', 'members', 'admin')),
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. INDEXES
-- =====================================================
CREATE INDEX idx_households_primary_name ON public.households (primary_member_name);
CREATE INDEX idx_households_city_state ON public.households (city, state);
CREATE INDEX idx_households_native_place ON public.households (native_place);
CREATE INDEX idx_households_status ON public.households (status);
CREATE INDEX idx_households_visibility ON public.households (visibility_level);

CREATE INDEX idx_persons_full_name ON public.persons (full_name);
CREATE INDEX idx_persons_status ON public.persons (status);

CREATE INDEX idx_household_members_household ON public.household_members (household_id);
CREATE INDEX idx_household_members_person ON public.household_members (person_id);
CREATE INDEX idx_household_members_relationship ON public.household_members (relationship_to_head);

CREATE INDEX idx_change_requests_status ON public.change_requests (status);
CREATE INDEX idx_change_requests_submitted_by ON public.change_requests (submitted_by);
CREATE INDEX idx_change_requests_reviewed_by ON public.change_requests (reviewed_by);

CREATE INDEX idx_audit_logs_performed_at ON public.audit_logs (performed_at DESC);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs (table_name, record_id);

CREATE INDEX idx_cultural_pages_category ON public.cultural_pages (category);
CREATE INDEX idx_cultural_pages_visibility ON public.cultural_pages (visibility_level);

-- =====================================================
-- 4. NOW CREATE FUNCTIONS THAT QUERY TABLES
--    (Must be after CREATE TABLE statements)
-- =====================================================

-- Get current user's profile id (from JWT)
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid();
$$;

-- Check if current user is approved member or admin
CREATE OR REPLACE FUNCTION public.is_approved_member()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'approved'
      AND role IN ('member', 'admin')
  );
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'approved'
  );
$$;

-- =====================================================
-- 5. TRIGGERS for updated_at (now safe)
-- =====================================================
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_households_updated_at BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_persons_updated_at BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_household_members_updated_at BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_cultural_pages_updated_at BEFORE UPDATE ON public.cultural_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- 6. SAFE VIEWS FOR PRIVACY
-- =====================================================

CREATE OR REPLACE VIEW public.public_households_view AS
SELECT
  id,
  household_code,
  primary_member_name,
  native_place,
  city,
  state,
  country,
  verified,
  status,
  created_at
FROM public.households
WHERE status = 'active'
  AND visibility_level IN ('public', 'members');

CREATE OR REPLACE VIEW public.public_persons_view AS
SELECT
  id,
  full_name,
  gender,
  date_of_birth,
  is_deceased,
  education,
  marital_status,
  status
FROM public.persons
WHERE status = 'active'
  AND visibility_level IN ('public', 'members');

CREATE OR REPLACE VIEW public.member_households_view AS
SELECT *
FROM public.households
WHERE status = 'active'
  AND visibility_level IN ('public', 'members');

CREATE OR REPLACE VIEW public.member_persons_view AS
SELECT *
FROM public.persons
WHERE status = 'active'
  AND visibility_level IN ('public', 'members');

CREATE OR REPLACE VIEW public.member_household_members_view AS
SELECT
  hm.*,
  p.full_name,
  p.gender,
  p.date_of_birth,
  p.is_deceased,
  p.education,
  p.marital_status,
  p.mobile_number,
  p.whatsapp_number,
  p.email
FROM public.household_members hm
JOIN public.persons p ON p.id = hm.person_id
WHERE p.status = 'active';

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_pages ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Allow insert for new users (trigger or server)" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- HOUSEHOLDS
CREATE POLICY "Public can view public households (via view mostly)" ON public.households
  FOR SELECT USING (
    status = 'active' AND visibility_level = 'public'
  );

CREATE POLICY "Approved members can view member-visible households" ON public.households
  FOR SELECT USING (
    public.is_approved_member() AND status = 'active' AND visibility_level IN ('public', 'members')
  );

CREATE POLICY "Admins full access households" ON public.households
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PERSONS
CREATE POLICY "Public can view public persons" ON public.persons
  FOR SELECT USING (
    status = 'active' AND visibility_level = 'public'
  );

CREATE POLICY "Approved members can view member-visible persons" ON public.persons
  FOR SELECT USING (
    public.is_approved_member() AND status = 'active' AND visibility_level IN ('public', 'members')
  );

CREATE POLICY "Admins full access persons" ON public.persons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- HOUSEHOLD_MEMBERS
CREATE POLICY "Public limited on household_members (prefer view)" ON public.household_members
  FOR SELECT USING (false);

CREATE POLICY "Approved members read household_members" ON public.household_members
  FOR SELECT USING (public.is_approved_member());

CREATE POLICY "Admins full access household_members" ON public.household_members
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RELATIONSHIPS
CREATE POLICY "Approved members can read relationships" ON public.relationships
  FOR SELECT USING (public.is_approved_member());

CREATE POLICY "Admins full access relationships" ON public.relationships
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CHANGE_REQUESTS
CREATE POLICY "Members can insert own change requests" ON public.change_requests
  FOR INSERT WITH CHECK (
    submitted_by = auth.uid() AND public.is_approved_member()
  );

CREATE POLICY "Members can view own change requests" ON public.change_requests
  FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Admins full access change_requests" ON public.change_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- AUDIT_LOGS
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins/service can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() IS NULL);

-- CULTURAL_PAGES
CREATE POLICY "Public can read public cultural pages" ON public.cultural_pages
  FOR SELECT USING (visibility_level = 'public');

CREATE POLICY "Approved members can read member cultural pages" ON public.cultural_pages
  FOR SELECT USING (
    public.is_approved_member() AND visibility_level IN ('public', 'members')
  );

CREATE POLICY "Admins full access cultural_pages" ON public.cultural_pages
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 8. AUTO PROFILE CREATION TRIGGER (on auth.users)
-- =====================================================

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 9. GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- End of 001_initial_schema.sql
