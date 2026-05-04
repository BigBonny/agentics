import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || 'Test Course'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('🧪 Simple upload test:', { fileName: file.name, fileSize: file.size, fileType: file.type })

    // Step 1: Check bucket
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === 'course-images')
    
    if (!bucketExists) {
      return NextResponse.json({ 
        error: 'course-images bucket not found',
        availableBuckets: buckets?.map(b => b.name) || []
      }, { status: 400 })
    }

    // Step 2: Simple upload
    const fileName = `test-${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('course-images')
      .upload(fileName, file)

    if (error) {
      console.error('❌ Upload failed:', error)
      return NextResponse.json({ 
        error: 'Upload failed',
        details: error.message,
        fileName,
        bucketInfo: {
          bucketExists,
          bucketName: 'course-images'
        }
      }, { status: 500 })
    }

    // Step 3: Get public URL
    const { data: urlData } = supabase.storage
      .from('course-images')
      .getPublicUrl(data.path)

    // Step 4: Create simple course record
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        title,
        description: `Test course from ${file.name}`,
        image_url: urlData.publicUrl,
        content_type: file.type === 'application/pdf' ? 'pdf' : 'image',
        extraction_status: 'pending',
        created_by: user.id,
        is_published: false,
        subject: 'test',
        level: 1,
        difficulty: 1,
        duration_hours: 1,
        topics: ['test'],
        learning_objectives: ['test objective'],
        prerequisites: []
      })
      .select()
      .single()

    if (courseError) {
      console.error('❌ Course creation failed:', courseError)
      return NextResponse.json({ 
        error: 'Course creation failed',
        details: courseError.message
      }, { status: 500 })
    }

    console.log('✅ Simple upload successful:', courseData.id)

    return NextResponse.json({
      success: true,
      course: courseData,
      fileUrl: urlData.publicUrl,
      message: 'Simple upload test successful'
    })

  } catch (error: any) {
    console.error('❌ Simple upload error:', error)
    return NextResponse.json({ 
      error: 'Simple upload failed',
      details: error.message
    }, { status: 500 })
  }
}
