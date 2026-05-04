-- Simplified sample data - no complex arrays
-- Run this if the main file still fails

-- Insert just one course first
INSERT INTO courses (
  title, 
  description, 
  subject, 
  level, 
  duration_hours, 
  prerequisites, 
  learning_objectives, 
  topics, 
  difficulty, 
  is_published,
  created_by
) VALUES 
(
  'Test Course',
  'A simple test course to verify database works',
  'mathématiques',
  5,
  10,
  ARRAY[]::text[],
  ARRAY['Learn basic math']::text[],
  ARRAY['Algebra']::text[],
  5,
  true,
  (SELECT id FROM users LIMIT 1)
);

-- If this works, the issue is with complex array data
-- If this fails, there's a database schema issue
