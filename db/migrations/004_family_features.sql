-- Add anniversary tracking to households
ALTER TABLE households ADD COLUMN IF NOT EXISTS anniversary_date DATE;

-- Add photo support to persons
ALTER TABLE persons ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create Announcements table (idempotent)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('birth', 'marriage', 'passing', 'general', 'reunion')),
    event_date DATE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on announcements (safe to re-run)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Announcements (use IF NOT EXISTS where supported)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'announcements' 
          AND policyname = 'Approved members can view announcements'
    ) THEN
        CREATE POLICY "Approved members can view announcements"
            ON announcements FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.status = 'approved'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'announcements' 
          AND policyname = 'Admins can create announcements'
    ) THEN
        CREATE POLICY "Admins can create announcements"
            ON announcements FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin' 
                    AND profiles.status = 'approved'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'announcements' 
          AND policyname = 'Admins can update announcements'
    ) THEN
        CREATE POLICY "Admins can update announcements"
            ON announcements FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin' 
                    AND profiles.status = 'approved'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'announcements' 
          AND policyname = 'Admins can delete announcements'
    ) THEN
        CREATE POLICY "Admins can delete announcements"
            ON announcements FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin' 
                    AND profiles.status = 'approved'
                )
            );
    END IF;
END $$;

-- Add to Realtime if needed (safe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'announcements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
    END IF;
END $$;
