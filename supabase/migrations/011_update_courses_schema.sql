-- Update courses table to include missing columns
-- Run this in Supabase SQL Editor

-- Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public';

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add content_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'content_type'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN content_type TEXT DEFAULT ''image''';
        RAISE NOTICE 'Added content_type column';
    END IF;

    -- Add extraction_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'extraction_status'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN extraction_status TEXT DEFAULT ''pending''';
        RAISE NOTICE 'Added extraction_status column';
    END IF;

    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'is_published'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT false';
        RAISE NOTICE 'Added is_published column';
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN created_by TEXT';
        RAISE NOTICE 'Added created_by column';
    END IF;

    -- Add subject column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'subject'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN subject TEXT DEFAULT ''general''';
        RAISE NOTICE 'Added subject column';
    END IF;

    -- Add level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'level'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN level INTEGER DEFAULT 5';
        RAISE NOTICE 'Added level column';
    END IF;

    -- Add difficulty column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'difficulty'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN difficulty INTEGER DEFAULT 5';
        RAISE NOTICE 'Added difficulty column';
    END IF;

    -- Add duration_hours column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'duration_hours'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN duration_hours INTEGER DEFAULT 10';
        RAISE NOTICE 'Added duration_hours column';
    END IF;

    -- Add topics column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'topics'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN topics JSONB DEFAULT ''[]''::jsonb';
        RAISE NOTICE 'Added topics column';
    END IF;

    -- Add learning_objectives column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'learning_objectives'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN learning_objectives JSONB DEFAULT ''[]''::jsonb';
        RAISE NOTICE 'Added learning_objectives column';
    END IF;

    -- Add prerequisites column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'prerequisites'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE courses ADD COLUMN prerequisites JSONB DEFAULT ''[]''::jsonb';
        RAISE NOTICE 'Added prerequisites column';
    END IF;
END $$;

-- Show updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;
