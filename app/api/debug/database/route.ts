import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Checking all progress data...')
    
    // Get ALL progress data to see what's there
    const { data: allProgress, error: allProgressError } = await supabase
      .from('progress')
      .select('*')
      .order('updated_at', { ascending: false })

    console.log('All progress data:', { allProgress, allProgressError })

    // Get all quiz attempts too
    const { data: allAttempts, error: allAttemptsError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('All quiz attempts:', { allAttempts, allAttemptsError })

    return NextResponse.json({ 
      progressData: allProgress || [],
      quizAttempts: allAttempts || [],
      progressError: allProgressError?.message,
      attemptsError: allAttemptsError?.message
    })

  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
