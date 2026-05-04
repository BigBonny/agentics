-- Simple test to verify array casting works
-- Run this first to test if the casting issue is resolved

-- Test basic array casting
SELECT 
  ARRAY['test1', 'test2', 'test3']::text[] as test_array;

-- This should work without errors and return: {test1,test2,test3}

-- If this works, then the main file should work too
