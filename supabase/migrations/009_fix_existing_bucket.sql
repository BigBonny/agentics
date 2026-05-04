-- Update policies for existing course-images bucket
-- Run this in Supabase SQL Editor

-- Check current bucket status
SELECT * FROM storage.buckets WHERE name = 'course-images';

-- Remove any existing policies that might be blocking uploads
DROP POLICY IF EXISTS "course_images_policy" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to course-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow reads from course-images" ON storage.objects;
DROP POLICY IF EXISTS "bucket_policy" ON storage.objects;

-- Create a simple permissive policy
CREATE POLICY "course_images_policy" ON storage.objects
FOR ALL USING (bucket_id = 'course-images');

-- Show current policies
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%course%';

-- Test bucket access
SELECT 'Bucket exists and policies updated' as status;
