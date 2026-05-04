-- First, let's check what columns exist in the progress table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'progress' 
ORDER BY ordinal_position;

-- Also check if the table exists at all
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'progress'
);

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  quiz_score INTEGER DEFAULT 0,
  last_quiz_date TIMESTAMP WITH TIME ZONE,
  total_time_spent INTEGER DEFAULT 0,
  weaknesses TEXT[],
  strengths TEXT[],
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Add columns one by one with error handling
DO $$
BEGIN
    -- Try to add each column individually
    BEGIN
        ALTER TABLE progress ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column quiz_score already exists';
    END;
    
    BEGIN
        ALTER TABLE progress ADD COLUMN IF NOT EXISTS last_quiz_date TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column last_quiz_date already exists';
    END;
    
    BEGIN
        ALTER TABLE progress ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column total_time_spent already exists';
    END;
    
    BEGIN
        ALTER TABLE progress ADD COLUMN IF NOT EXISTS weaknesses TEXT[];
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column weaknesses already exists';
    END;
    
    BEGIN
        ALTER TABLE progress ADD COLUMN IF NOT EXISTS strengths TEXT[];
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column strengths already exists';
    END;
    
    BEGIN
        ALTER TABLE progress ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Column completion_percentage already exists';
    END;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course_id ON progress(course_id);

-- Show final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'progress' 
ORDER BY ordinal_position;
