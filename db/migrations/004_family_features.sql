-- Add anniversary tracking to households
ALTER TABLE households ADD COLUMN anniversary_date DATE;

-- Add photo support to persons
ALTER TABLE persons ADD COLUMN avatar_url TEXT;

-- Create Announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('birth', 'marriage', 'passing', 'general', 'reunion')),
    event_date DATE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Announcements
CREATE POLICY "Approved members can view announcements"
    ON announcements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.status = 'approved'
        )
    );

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

-- Add to Realtime if needed
alter publication supabase_realtime add table announcements;
