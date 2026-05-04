import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Manual test: Inserting progress data...')
    
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000001',
      course_id: 'd4283008-90fc-4911-8fe7-a1b793fbf898',
      quiz_score: 75,
      last_quiz_date: new Date().toISOString(),
      total_time_spent: 120,
      weaknesses: ['test weakness'],
      strengths: ['test strength'],
      completion_percentage: 75,
      updated_at: new Date().toISOString()
    }

    console.log('Inserting test data:', testData)

    // Try simple insert first
    const { data: insertResult, error: insertError } = await supabase
      .from('progress')
      .insert(testData)
      .select()

    console.log('Insert result:', { insertResult, insertError })

    if (insertError) {
      console.log('Insert failed, trying upsert...')
      // Try upsert if insert fails
      const { data: upsertResult, error: upsertError } = await supabase
        .from('progress')
        .upsert(testData)
        .select()

      console.log('Upsert result:', { upsertResult, upsertError })

      if (upsertError) {
        console.error('Both insert and upsert failed:', { insertError, upsertError })
        return NextResponse.json({ 
          success: false,
          error: 'Both insert and upsert failed',
          insertError: insertError.message,
          upsertError: upsertError.message,
          testData: testData
        })
      }

      return NextResponse.json({ 
        success: true, 
        method: 'upsert',
        result: upsertResult,
        testData: testData
      })
    }

    return NextResponse.json({ 
      success: true, 
      method: 'insert',
      result: insertResult,
      testData: testData
    })

  } catch (error) {
    console.error('Manual test error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Manual test GET: Checking if we can read progress data...')
    
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')

    console.log('GET progress result:', { progressData, progressError })

    return NextResponse.json({ 
      message: 'GET test successful',
      progressData: progressData || [],
      progressError: progressError?.message,
      count: progressData?.length || 0
    })

  } catch (error) {
    console.error('Manual test GET error:', error)
    return NextResponse.json(
      { error: 'GET Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
