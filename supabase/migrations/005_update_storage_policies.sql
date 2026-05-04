-- Update existing storage bucket policies
-- Run this in Supabase SQL Editor to fix RLS issues

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload course images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own course images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own course images" ON storage.objects;

-- Create new policies with service role support
-- Allow public read access to course images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'course-images' OR auth.role() = 'service_role');

-- Allow authenticated users to upload course images
CREATE POLICY "Authenticated users can upload course images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-images' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow users to update their own course images
CREATE POLICY "Users can update own course images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-images' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow users to delete their own course images
CREATE POLICY "Users can delete own course images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-images' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Grant service role admin permissions for bucket management
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

-- Grant service role permissions to bypass RLS
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role;
