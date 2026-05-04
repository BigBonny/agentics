import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    steps: [] as any[],
    errors: [] as any[]
  }

  try {
    // Step 1: Check buckets
    debugInfo.steps.push("Checking buckets...")
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      debugInfo.errors.push({ step: "listBuckets", error: bucketsError })
      return NextResponse.json({ 
        success: false, 
        debugInfo,
        error: "Failed to list buckets" 
      }, { status: 500 })
    }
    
    debugInfo.steps.push({
      action: "listBuckets",
      result: buckets,
      courseBucketExists: buckets?.some(b => b.name === 'course-images')
    })

    const courseBucket = buckets?.find(b => b.name === 'course-images')
    
    if (!courseBucket) {
      debugInfo.errors.push({ error: "course-images bucket not found" })
      return NextResponse.json({ 
        success: false, 
        debugInfo,
        error: "Bucket not found" 
      }, { status: 400 })
    }

    // Step 2: Check policies
    debugInfo.steps.push("Checking policies...")
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
    
    debugInfo.steps.push({
      action: "checkPolicies",
      result: policies,
      error: policiesError
    })

    // Step 3: Test upload permissions with a dummy file
    debugInfo.steps.push("Testing upload permissions...")
    
    // Create a simple test file
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    const testFileName = `test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-images')
      .upload(testFileName, testFile)
    
    debugInfo.steps.push({
      action: "testUpload",
      result: uploadData,
      error: uploadError
    })

    if (uploadError) {
      debugInfo.errors.push({ step: "testUpload", error: uploadError })
    } else {
      // Clean up test file
      await supabase.storage.from('course-images').remove([testFileName])
      debugInfo.steps.push("Test upload successful - file cleaned up")
    }

    // Step 4: Check bucket settings
    debugInfo.steps.push("Checking bucket details...")
    debugInfo.steps.push({
      action: "bucketDetails",
      details: {
        id: courseBucket.id,
        name: courseBucket.name,
        public: courseBucket.public,
        file_size_limit: courseBucket.file_size_limit,
        allowed_mime_types: courseBucket.allowed_mime_types
      }
    })

    return NextResponse.json({
      success: true,
      debugInfo,
      summary: {
        bucketExists: true,
        uploadTest: !uploadError,
        policiesCount: policies?.length || 0,
        bucketPublic: courseBucket.public
      }
    })

  } catch (error: any) {
    debugInfo.errors.push({ step: "general", error: error.message })
    return NextResponse.json({ 
      success: false, 
      debugInfo,
      error: "Debug failed" 
    }, { status: 500 })
  }
}
