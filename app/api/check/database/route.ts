import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Checking progress table...')
    
    // Try to select from the progress table to see if it exists and what columns it has
    const { data: testData, error: testError } = await supabase
      .from('progress')
      .select('*')
      .limit(1)

    console.log('Progress table check result:', { testData, testError })

    if (testError) {
      if (testError.code === 'PGRST116') {
        // Table doesn't exist
        console.log('Progress table does not exist')
        return NextResponse.json({ 
          message: 'Progress table does not exist',
          tableExists: false,
          error: testError.message,
          code: testError.code
        })
      } else {
        // Other error
        console.log('Other error accessing progress table:', testError)
        return NextResponse.json({ 
          message: 'Error accessing progress table',
          tableExists: 'unknown',
          error: testError.message,
          code: testError.code,
          details: testError
        })
      }
    }

    // If we got here, the table exists
    console.log('Progress table exists, data:', testData)
    const columns = testData ? Object.keys(testData) : []
    
    // Also try to get the count
    const { count, error: countError } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
    
    console.log('Progress table count:', { count, countError })
    
    return NextResponse.json({ 
      message: 'Progress table exists',
      tableExists: true,
      columns: columns,
      sampleData: testData,
      rowCount: count,
      countError: countError?.message
    })

  } catch (error) {
    console.error('Error checking database structure:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
