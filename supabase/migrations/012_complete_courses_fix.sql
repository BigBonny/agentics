-- Complete database schema fix for courses table
-- This will create the full courses table with all required columns
-- Run this in Supabase SQL Editor

-- First, drop the existing courses table if it exists
DROP TABLE IF EXISTS courses CASCADE;

-- Create the complete courses table with all required columns
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    content_type TEXT DEFAULT 'image',
    extraction_status TEXT DEFAULT 'pending',
    is_published BOOLEAN DEFAULT false,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subject TEXT DEFAULT 'general',
    level INTEGER DEFAULT 5,
    difficulty INTEGER DEFAULT 5,
    duration_hours INTEGER DEFAULT 10,
    topics JSONB DEFAULT '[]'::jsonb,
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'inactive'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_extraction_status ON courses(extraction_status);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own courses" ON courses
    FOR SELECT USING (auth.uid()::text = created_by);

CREATE POLICY "Users can insert their own courses" ON courses
    FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update their own courses" ON courses
    FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete their own courses" ON courses
    FOR DELETE USING (auth.uid()::text = created_by);

CREATE POLICY "Public can view published courses" ON courses
    FOR SELECT USING (is_published = true);

-- Grant permissions
GRANT ALL ON courses TO authenticated;
GRANT SELECT ON courses TO anon;

-- Verify table creation
SELECT 'Courses table created successfully' as status;

-- Show table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;
