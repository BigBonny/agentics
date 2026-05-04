-- Create the course-images bucket manually
-- Run this in Supabase SQL Editor

-- First, check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'course-images';

-- If it doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create simple policies
DROP POLICY IF EXISTS "Allow uploads to course-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow reads from course-images" ON storage.objects;

CREATE POLICY "Allow uploads to course-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Allow reads from course-images" ON storage.objects
FOR SELECT USING (bucket_id = 'course-images');

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE name = 'course-images';

-- Show current policies
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%course-images%';
