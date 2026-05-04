-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'center')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  max_score INTEGER NOT NULL CHECK (max_score > 0),
  responses JSONB NOT NULL,
  feedback JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress table
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  mastery_level INTEGER NOT NULL CHECK (mastery_level >= 0 AND mastery_level <= 100),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject, topic)
);

-- Create study_sessions table
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration >= 0),
  activities JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content table
CREATE TABLE content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  prerequisites TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  embedding VECTOR(1536), -- For vector search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_subject ON evaluations(subject);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_subject ON progress(subject);
CREATE INDEX idx_progress_mastery_level ON progress(mastery_level);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_created_at ON study_sessions(created_at);
CREATE INDEX idx_content_subject ON content(subject);
CREATE INDEX idx_content_topic ON content(topic);
CREATE INDEX idx_content_difficulty ON content(difficulty);

-- Create vector indexes for AI search (only if pgvector is available)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        CREATE INDEX idx_content_embedding ON content USING ivfflat (embedding vector_cosine_ops);
    END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (clerk_id::text = auth.uid()::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (clerk_id::text = auth.uid()::text);

CREATE POLICY "Users can view own evaluations" ON evaluations FOR SELECT USING (user_id::text = (SELECT id::text FROM users WHERE clerk_id::text = auth.uid()::text));
CREATE POLICY "Users can insert own evaluations" ON evaluations FOR INSERT WITH CHECK (user_id::text = (SELECT id::text FROM users WHERE clerk_id::text = auth.uid()::text));

CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (user_id::text = (SELECT id::text FROM users WHERE clerk_id::text = auth.uid()::text));
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (user_id::text = (SELECT id::text FROM users WHERE clerk_id::text = auth.uid()::text));
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (user_id::text = (SELECT id::text FROM users WHERE clerk_id::text = auth.uid()::text));

CREATE POLICY "Users can view own study sessions" ON study_sessions FOR SELECT USING (user_id::text = (SELECT id::text FROM users WHERE clerk_id::text = auth.uid()::text));
CREATE POLICY "Users can insert own study sessions" ON study_sessions FOR INSERT WITH CHECK (user_id::text = (SELECT id::text FROM users WHERE clerk_id::text = auth.uid()::text));

-- Content is publicly readable (for the RAG system)
CREATE POLICY "Content is publicly readable" ON content FOR SELECT USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
