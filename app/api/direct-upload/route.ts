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

    console.log('🚀 Direct upload test:', { fileName: file.name, fileSize: file.size, fileType: file.type })

    // Skip bucket check - we know it exists in dashboard
    // Try direct upload without checking first
    
    const fileExt = file.name.split('.').pop()
    const fileName = `direct-${Date.now()}.${fileExt}`
    const filePath = `course-images/${fileName}`

    console.log('📤 Attempting direct upload to:', filePath)

    const { data, error } = await supabase.storage
      .from('course-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Try upsert in case of conflicts
        contentType: file.type
      })

    if (error) {
      console.error('❌ Direct upload failed:', error)
      
      // Try alternative approaches
      console.log('🔄 Trying alternative upload methods...')
      
      // Try 1: Different path
      try {
        const altPath = `courses/${fileName}`
        const { data: altData, error: altError } = await supabase.storage
          .from('course-images')
          .upload(altPath, file)
        
        if (!altError) {
          console.log('✅ Alternative upload successful:', altPath)
          return createCourseRecord(altData, file, user, title)
        }
      } catch (e) {
        console.error('❌ Alternative upload also failed:', e)
      }
      
      return NextResponse.json({ 
        error: 'All upload methods failed',
        details: {
          mainError: error.message,
          bucket: 'course-images',
          filePath,
          fileType: file.type,
          fileSize: file.size
        }
      }, { status: 500 })
    }

    console.log('✅ Direct upload successful:', data.path)
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-images')
      .getPublicUrl(data.path)

    return createCourseRecord(data, file, user, title, urlData.publicUrl)

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 })
  }
}

async function createCourseRecord(uploadData: any, file: File, user: any, title: string, imageUrl?: string) {
  try {
    // Get public URL if not provided
    if (!imageUrl) {
      const { data: urlData } = supabase.storage
        .from('course-images')
        .getPublicUrl(uploadData.path)
      imageUrl = urlData.publicUrl
    }

    // Create course record
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        title,
        description: `Course from ${file.name}`,
        image_url: imageUrl,
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

    console.log('✅ Course created successfully:', courseData.id)

    // Trigger AI content extraction
    setTimeout(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/ai/extract-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: courseData.id,
            imageUrl: imageUrl,
            contentType: file.type
          })
        })
      } catch (error) {
        console.error('❌ Error triggering AI extraction:', error)
      }
    }, 1000)

    return NextResponse.json({
      success: true,
      course: courseData,
      fileUrl: imageUrl,
      message: 'Direct upload successful'
    })

  } catch (error: any) {
    console.error('❌ Course creation error:', error)
    return NextResponse.json({ 
      error: 'Course creation failed',
      details: error.message
    }, { status: 500 })
  }
}
