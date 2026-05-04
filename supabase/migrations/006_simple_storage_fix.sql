-- Simple storage bucket fix - run this in Supabase SQL Editor
-- This only requires basic permissions

-- Check if policies exist and remove them if they cause issues
DO $$
BEGIN
    -- Try to drop policies that might be blocking uploads
    BEGIN
        DROP POLICY IF EXISTS "Public Access" ON storage.objects;
        RAISE NOTICE 'Dropped Public Access policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop Public Access policy: %', SQLERRM;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Authenticated users can upload course images" ON storage.objects;
        RAISE NOTICE 'Dropped Authenticated users policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop Authenticated users policy: %', SQLERRM;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can update own course images" ON storage.objects;
        RAISE NOTICE 'Dropped Users can update policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop Users can update policy: %', SQLERRM;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can delete own course images" ON storage.objects;
        RAISE NOTICE 'Dropped Users can delete policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop Users can delete policy: %', SQLERRM;
    END;
END $$;

-- Create a simple policy that allows uploads
CREATE POLICY "Allow uploads to course-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'course-images');

-- Create a simple policy that allows reads
CREATE POLICY "Allow reads from course-images" ON storage.objects
FOR SELECT USING (bucket_id = 'course-images');

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
ORDER BY policyname;
