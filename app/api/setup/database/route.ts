import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create quiz_attempts table
    const { error: quizAttemptsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          course_id UUID NOT NULL,
          score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          percentage INTEGER NOT NULL,
          time_taken INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          incorrect_answers INTEGER NOT NULL,
          weaknesses TEXT[],
          strengths TEXT[],
          feedback TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON quiz_attempts(course_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);
      `
    })

    // Create progress table
    const { error: progressError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          course_id UUID NOT NULL,
          quiz_score INTEGER DEFAULT 0,
          last_quiz_date TIMESTAMP WITH TIME ZONE,
          total_time_spent INTEGER DEFAULT 0,
          weaknesses TEXT[],
          strengths TEXT[],
          completion_percentage INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, course_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_progress_course_id ON progress(course_id);
      `
    })

    if (quizAttemptsError || progressError) {
      console.error('Error creating tables:', { quizAttemptsError, progressError })
      return NextResponse.json(
        { error: 'Failed to create tables', details: { quizAttemptsError, progressError } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Tables created successfully' })
  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
