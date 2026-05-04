-- Add courses and quiz system to existing schema

-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
  duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
  prerequisites TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] NOT NULL,
  topics TEXT[] NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_content table
CREATE TABLE course_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'exercise', 'video', 'reading')),
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  embedding VECTOR(1536), -- For vector search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  passing_score INTEGER NOT NULL CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  options JSONB, -- For multiple choice questions
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  topic TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  max_score INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER,
  answers JSONB NOT NULL,
  feedback JSONB,
  passed BOOLEAN NOT NULL,
  UNIQUE(user_id, quiz_id, attempt_number)
);

-- Create course_enrollments table
CREATE TABLE course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create course_progress table
CREATE TABLE course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  content_id UUID REFERENCES course_content(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, content_id)
);

-- Update existing progress table to include course context
ALTER TABLE progress ADD COLUMN course_id UUID REFERENCES courses(id);
ALTER TABLE progress ADD COLUMN content_id UUID REFERENCES course_content(id);

-- Create indexes for new tables
CREATE INDEX idx_courses_subject ON courses(subject);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_course_content_course_id ON course_content(course_id);
CREATE INDEX idx_course_content_type ON course_content(type);
CREATE INDEX idx_course_content_order ON course_content(course_id, order_index);
CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_score ON quiz_attempts(score);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);

-- Create vector indexes for AI search (only if pgvector is available)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        CREATE INDEX idx_course_content_embedding ON course_content USING ivfflat (embedding vector_cosine_ops);
        CREATE INDEX idx_questions_embedding ON questions USING ivfflat (embedding vector_cosine_ops);
    END IF;
END $$;

-- Enable RLS for new tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Courses are publicly readable, only creators can update
CREATE POLICY "Courses are publicly readable" ON courses FOR SELECT USING (is_published = true OR created_by = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage own courses" ON courses FOR ALL USING (created_by = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Course content follows course permissions
CREATE POLICY "Course content readable via course" ON course_content FOR SELECT USING (
  course_id IN (
    SELECT id FROM courses 
    WHERE is_published = true OR created_by = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  )
);

-- Quizzes follow course permissions
CREATE POLICY "Quizzes readable via course" ON quizzes FOR SELECT USING (
  course_id IN (
    SELECT id FROM courses 
    WHERE is_published = true OR created_by = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  )
);

-- Questions follow quiz permissions
CREATE POLICY "Questions readable via quiz" ON questions FOR SELECT USING (
  quiz_id IN (
    SELECT id FROM quizzes 
    WHERE course_id IN (
      SELECT id FROM courses 
      WHERE is_published = true OR created_by = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    )
  )
);

-- Users can manage own quiz attempts
CREATE POLICY "Users can manage own quiz attempts" ON quiz_attempts FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Users can manage own enrollments
CREATE POLICY "Users can manage own enrollments" ON course_enrollments FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Users can manage own course progress
CREATE POLICY "Users can manage own course progress" ON course_progress FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Create updated_at trigger for new tables
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_content_updated_at BEFORE UPDATE ON course_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
