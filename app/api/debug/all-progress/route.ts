import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Checking ALL progress data in database...')
    
    // Get ALL progress data regardless of user_id
    const { data: allProgress, error: allProgressError } = await supabase
      .from('progress')
      .select('*')
      .order('updated_at', { ascending: false })

    console.log('All progress in database:', { allProgress, allProgressError })

    // Also check if there's any data with our test UUID
    const { data: testProgress, error: testProgressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')

    console.log('Test UUID progress:', { testProgress, testProgressError })

    return NextResponse.json({ 
      allProgress: allProgress || [],
      testProgress: testProgress || [],
      totalRecords: allProgress?.length || 0,
      testRecords: testProgress?.length || 0,
      allProgressError: allProgressError?.message,
      testProgressError: testProgressError?.message
    })

  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
