import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create the progress table with all required columns
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
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
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_progress_course_id ON progress(course_id);
        
        -- Disable RLS for testing
        ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
      `
    })

    if (createError) {
      console.error('Error creating table:', createError)
      return NextResponse.json({ 
        error: 'Failed to create table', 
        details: createError 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Progress table created successfully' 
    })

  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
