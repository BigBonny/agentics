-- Check if bucket actually exists and create it with a different approach
-- Run this in Supabase SQL Editor

-- First, let's see what's actually in the storage buckets table
SELECT * FROM storage.buckets;

-- Try to create the bucket with a different name first to test permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'test-bucket',
  'test-bucket',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- If that works, then try to create the actual course-images bucket
-- If the course-images bucket somehow exists but isn't showing up, let's try to delete and recreate
DELETE FROM storage.buckets WHERE id = 'course-images';

-- Now create it fresh
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Create a very simple policy
DROP POLICY IF EXISTS "course_policy" ON storage.objects;

CREATE POLICY "course_policy" ON storage.objects
FOR ALL USING (bucket_id = 'course-images');

-- Verify everything
SELECT * FROM storage.buckets WHERE name IN ('course-images', 'test-bucket');

-- Clean up test bucket if it exists
DELETE FROM storage.buckets WHERE id = 'test-bucket';
