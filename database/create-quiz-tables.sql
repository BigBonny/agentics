-- Update existing progress table to work with our quiz system
-- Note: quiz_attempts table already exists with different structure
-- We'll adapt our code to work with the existing schema

-- Add missing columns to progress table if they don't exist
ALTER TABLE progress ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS last_quiz_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS weaknesses TEXT[];
ALTER TABLE progress ADD COLUMN IF NOT EXISTS strengths TEXT[];
ALTER TABLE progress ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course_id ON progress(course_id);

-- Add RLS policies for progress (if not already enabled)
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON progress
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own progress" ON progress
  FOR UPDATE USING (auth.uid()::text = user_id);

-- For testing, disable RLS (remove this in production)
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
