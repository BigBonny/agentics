-- Fix RLS policies and file size limits
-- Run this in Supabase SQL Editor

-- 1. Fix RLS policies for courses table
DROP POLICY IF EXISTS "Users can view their own courses" ON courses;
DROP POLICY IF EXISTS "Users can insert their own courses" ON courses;
DROP POLICY IF EXISTS "Users can update their own courses" ON courses;
DROP POLICY IF EXISTS "Users can delete their own courses" ON courses;
DROP POLICY IF EXISTS "Public can view published courses" ON courses;

-- Create permissive policies that allow uploads
CREATE POLICY "Enable course uploads" ON courses
FOR ALL USING (
  auth.role() = 'authenticated' OR 
  auth.uid()::text IS NOT NULL
);

-- 2. Update bucket file size limit (increase to 50MB)
UPDATE storage.buckets 
SET file_size_limit = 52428800 
WHERE id = 'course-images';

-- 3. Verify the changes
SELECT 
  name,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'course-images';

-- 4. Show current RLS policies
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'courses' 
ORDER BY policyname;

-- 5. Grant service role permissions
GRANT ALL ON courses TO service_role;
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- 6. Enable service role bypass
ALTER POLICY "Enable course uploads" ON courses 
USING (
  auth.role() = 'authenticated' OR 
  auth.uid()::text IS NOT NULL OR
  auth.role() = 'service_role'
);

SELECT 'RLS policies updated and file size limit increased' as status;
