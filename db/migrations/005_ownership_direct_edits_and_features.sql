-- =====================================================
-- 005: Ownership-based direct edits (no approval for own data)
--      + Lineage columns + Notifications + enhanced RLS
-- Run this in Supabase SQL editor after previous migrations.
-- =====================================================

-- 1. Lineage-friendly columns on persons (for graph / parent_ids style)
ALTER TABLE public.persons
  ADD COLUMN IF NOT EXISTS father_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mother_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS spouse_id uuid REFERENCES public.persons(id) ON DELETE SET NULL;

-- Helpful indexes for traversal
CREATE INDEX IF NOT EXISTS idx_persons_father ON public.persons(father_id);
CREATE INDEX IF NOT EXISTS idx_persons_mother ON public.persons(mother_id);
CREATE INDEX IF NOT EXISTS idx_persons_spouse ON public.persons(spouse_id);

-- 2. Optional explicit owner on households (falls back to created_by)
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS owner_profile_id uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_households_owner ON public.households(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_households_created_by ON public.households(created_by);

-- 3. Notifications table (in-app Community News broadcasts, segmented)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('general','birth','marriage','death','obituary','announcement')),
  related_table text,
  related_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS: owners see only their notifications; admins can manage all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='notifications' AND policyname='Users read own notifications'
  ) THEN
    CREATE POLICY "Users read own notifications" ON public.notifications
      FOR SELECT USING (recipient_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='notifications' AND policyname='Users can mark own read'
  ) THEN
    CREATE POLICY "Users can mark own read" ON public.notifications
      FOR UPDATE USING (recipient_id = auth.uid())
      WITH CHECK (recipient_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='notifications' AND policyname='Admins full access notifications'
  ) THEN
    CREATE POLICY "Admins full access notifications" ON public.notifications
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Allow service inserts (for broadcasts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='notifications' AND policyname='Service can insert notifications'
  ) THEN
    CREATE POLICY "Service can insert notifications" ON public.notifications
      FOR INSERT WITH CHECK (auth.uid() IS NULL OR public.is_admin());
  END IF;
END $$;

-- Realtime for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- 4. Update RLS to allow APPROVED owners direct management of THEIR data
--    (no change_request needed for own household/person)

-- HOUSEHOLDS: owner (created_by or owner_profile_id) can do everything on their row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='households' AND policyname='Approved owners manage own households'
  ) THEN
    CREATE POLICY "Approved owners manage own households" ON public.households
      FOR ALL
      USING (
        public.is_approved_member() AND (
          created_by = auth.uid() OR owner_profile_id = auth.uid()
        )
      )
      WITH CHECK (
        public.is_approved_member() AND (
          created_by = auth.uid() OR owner_profile_id = auth.uid()
        )
      );
  END IF;
END $$;

-- PERSONS: owner can manage persons they created OR persons belonging to households they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='persons' AND policyname='Approved owners manage own persons'
  ) THEN
    CREATE POLICY "Approved owners manage own persons" ON public.persons
      FOR ALL
      USING (
        public.is_approved_member() AND (
          created_by = auth.uid()
          OR id IN (
            SELECT hm.person_id FROM public.household_members hm
            JOIN public.households h ON h.id = hm.household_id
            WHERE h.created_by = auth.uid() OR h.owner_profile_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        public.is_approved_member() AND (
          created_by = auth.uid()
          OR id IN (
            SELECT hm.person_id FROM public.household_members hm
            JOIN public.households h ON h.id = hm.household_id
            WHERE h.created_by = auth.uid() OR h.owner_profile_id = auth.uid()
          )
        )
      );
  END IF;
END $$;

-- HOUSEHOLD_MEMBERS: allow owners to manage links in their household
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='household_members' AND policyname='Approved owners manage household_members'
  ) THEN
    CREATE POLICY "Approved owners manage household_members" ON public.household_members
      FOR ALL
      USING (
        public.is_approved_member() AND household_id IN (
          SELECT id FROM public.households 
          WHERE created_by = auth.uid() OR owner_profile_id = auth.uid()
        )
      )
      WITH CHECK (
        public.is_approved_member() AND household_id IN (
          SELECT id FROM public.households 
          WHERE created_by = auth.uid() OR owner_profile_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RELATIONSHIPS: owners can manage relationships involving their persons
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='relationships' AND policyname='Approved owners manage relationships'
  ) THEN
    CREATE POLICY "Approved owners manage relationships" ON public.relationships
      FOR ALL
      USING (
        public.is_approved_member() AND (
          created_by = auth.uid()
          OR person_id IN (
            SELECT id FROM public.persons p WHERE p.created_by = auth.uid()
            OR p.id IN (
              SELECT hm.person_id FROM public.household_members hm
              JOIN public.households h ON h.id = hm.household_id
              WHERE h.created_by = auth.uid() OR h.owner_profile_id = auth.uid()
            )
          )
          OR related_person_id IN (
            SELECT id FROM public.persons p WHERE p.created_by = auth.uid()
            OR p.id IN (
              SELECT hm.person_id FROM public.household_members hm
              JOIN public.households h ON h.id = hm.household_id
              WHERE h.created_by = auth.uid() OR h.owner_profile_id = auth.uid()
            )
          )
        )
      )
      WITH CHECK (
        public.is_approved_member() AND (
          created_by = auth.uid()
          OR person_id IN (
            SELECT id FROM public.persons p WHERE p.created_by = auth.uid()
            OR p.id IN (
              SELECT hm.person_id FROM public.household_members hm
              JOIN public.households h ON h.id = hm.household_id
              WHERE h.created_by = auth.uid() OR h.owner_profile_id = auth.uid()
            )
          )
        )
      );
  END IF;
END $$;

-- Note: Admin policies remain (they take precedence via broader grants).
-- Public/approved SELECT policies are unchanged.

-- 5. Make sure change_requests still work for legacy/cross requests but are no longer required for own
-- (existing policies kept)

-- End of 005
