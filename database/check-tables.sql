-- Quick test to check if tables exist
-- Run this in Supabase SQL Editor first

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- If you don't see 'users' and 'courses' in the list, run the migrations:

-- Run this first:
-- \i supabase/migrations/001_initial_schema.sql

-- Then run this:
-- \i supabase/migrations/002_courses_schema.sql

-- Or copy-paste the content of both migration files directly into the SQL editor
