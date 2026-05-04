-- Create Supabase Storage bucket for course images
-- Run this in Supabase SQL Editor

-- Insert bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Set up Row Level Security (RLS) policies
-- Allow public read access to course images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'course-images');

-- Allow authenticated users to upload course images
CREATE POLICY "Authenticated users can upload course images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their own course images
CREATE POLICY "Users can update own course images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their own course images
CREATE POLICY "Users can delete own course images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-images' AND 
  auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Grant service role admin permissions for bucket management
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- Allow service role to bypass RLS for bucket operations
ALTER POLICY "Public Access" ON storage.objects USING (bucket_id = 'course-images' OR auth.role() = 'service_role');
ALTER POLICY "Authenticated users can upload course images" ON storage.objects USING (bucket_id = 'course-images' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
ALTER POLICY "Users can update own course images" ON storage.objects USING (bucket_id = 'course-images' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
ALTER POLICY "Users can delete own course images" ON storage.objects USING (bucket_id = 'course-images' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
