import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to list buckets', 
        details: error.message 
      }, { status: 500 })
    }

    const courseBucket = buckets?.find(bucket => bucket.name === 'course-images')
    
    return NextResponse.json({
      success: true,
      buckets: buckets,
      courseBucketExists: !!courseBucket,
      courseBucketDetails: courseBucket,
      totalBuckets: buckets?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}
