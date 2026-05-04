-- Create course-images bucket with minimal permissions
-- This should work with basic user permissions

-- First, try to create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- If that fails, try without the ON CONFLICT clause
-- Then create minimal policies
DROP POLICY IF EXISTS "bucket_policy" ON storage.objects;

CREATE POLICY "bucket_policy" ON storage.objects
FOR ALL USING (bucket_id = 'course-images');

-- Verify creation
SELECT * FROM storage.buckets WHERE name = 'course-images';
