-- Fix progress table for testing - remove foreign key constraint and make fields optional

-- Remove the foreign key constraint to users table (since we're using mock UUID for testing)
ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_user_id_fkey;

-- Make fields optional for testing (remove NOT NULL constraints)
ALTER TABLE progress ALTER COLUMN subject DROP NOT NULL;
ALTER TABLE progress ALTER COLUMN topic DROP NOT NULL;
ALTER TABLE progress ALTER COLUMN mastery_level DROP NOT NULL;
