import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple debug: Testing database connection...')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(1)

    console.log('Database test result:', { testData, testError })

    // Test progress table
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .limit(5)

    console.log('Progress table result:', { progressData, progressError })

    return NextResponse.json({ 
      message: 'Database connection test',
      coursesTest: testData ? 'OK' : 'FAILED',
      coursesError: testError?.message,
      progressTest: progressData ? 'OK' : 'FAILED', 
      progressError: progressError?.message,
      progressCount: progressData?.length || 0,
      sampleProgress: progressData || []
    })

  } catch (error) {
    console.error('Simple debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
