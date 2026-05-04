-- Clean database and setup fresh data
-- Run this first to clear any existing data that might cause conflicts

-- Step 1: Clean existing data (optional)
-- DELETE FROM users WHERE clerk_id LIKE 'mock-user-id%';
-- DELETE FROM courses WHERE created_by IN (SELECT id FROM users WHERE clerk_id LIKE 'mock-user-id%');
-- DELETE FROM course_content WHERE course_id IN (SELECT id FROM courses WHERE title LIKE '%');
-- DELETE FROM quizzes WHERE course_id IN (SELECT id FROM courses WHERE title LIKE '%');
-- DELETE FROM questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE title LIKE '%');

-- Step 2: Create fresh user and courses
INSERT INTO users (
  clerk_id,
  email,
  first_name,
  last_name,
  subscription_tier,
  subscription_status
) VALUES 
(
  'test-user-2026-03-20',
  'test@example.com',
  'Test',
  'User',
  'free',
  'active'
);

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
  'Test Course 1',
  'A simple test course for verification',
  'test-subject',
  1,
  5,
  ARRAY['Test prerequisite']::text[],
  ARRAY['Test objective 1']::text[],
  ARRAY['Test topic 1']::text[],
  1,
  true,
  (SELECT id FROM users WHERE clerk_id = 'test-user-2026-03-20' LIMIT 1)
),
(
  'Test Course 2',
  'Another test course',
  'test-subject',
  2,
  10,
  ARRAY['Test prerequisite 2']::text[],
  ARRAY['Test objective 2']::text[],
  ARRAY['Test topic 2']::text[],
  2,
  true,
  (SELECT id FROM users WHERE clerk_id = 'test-user-2026-03-20' LIMIT 1)
);
