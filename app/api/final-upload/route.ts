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
    const description = formData.get('description') as string || ''
    const subject = formData.get('subject') as string || 'general'
    const level = parseInt(formData.get('level') as string) || 5
    const difficulty = parseInt(formData.get('difficulty') as string) || 5
    const duration_hours = parseInt(formData.get('duration_hours') as string) || 10
    const topics = JSON.parse(formData.get('topics') as string || '[]')
    const learning_objectives = JSON.parse(formData.get('learning_objectives') as string || '[]')
    const prerequisites = JSON.parse(formData.get('prerequisites') as string || '[]')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('🚀 Final upload test:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    })

    // Upload file to storage - assume bucket exists
    const fileExt = file.name.split('.').pop()
    const fileName = `final-${Date.now()}.${fileExt}`
    const filePath = `course-images/${fileName}`

    console.log('📤 Uploading to:', filePath)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError)
      return NextResponse.json({ 
        error: 'Upload failed',
        details: uploadError.message,
        fileName,
        filePath
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-images')
      .getPublicUrl(uploadData.path)

    const imageUrl = urlData.publicUrl

    // Create course record
    const courseData = {
      title,
      description,
      image_url: imageUrl,
      content_type: file.type === 'application/pdf' ? 'pdf' : 'image',
      extraction_status: 'pending',
      is_published: false,
      created_by: user.id,
      subject,
      level,
      difficulty,
      duration_hours,
      topics,
      learning_objectives,
      prerequisites
    }

    console.log('💾 Creating course record:', courseData)

    const { data: courseResult, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single()

    if (courseError) {
      console.error('❌ Course creation failed:', courseError)
      
      // Clean up uploaded file if course creation fails
      await supabase.storage.from('course-images').remove([filePath])
      
      return NextResponse.json({ 
        error: 'Course creation failed',
        details: courseError.message,
        courseData
      }, { status: 500 })
    }

    console.log('✅ Course created successfully:', courseResult.id)

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
            courseId: courseResult.id,
            imageUrl: imageUrl,
            contentType: file.type
          })
        })
        console.log('🤖 AI extraction triggered for course:', courseResult.id)
      } catch (error) {
        console.error('❌ Error triggering AI extraction:', error)
      }
    }, 1000)

    return NextResponse.json({
      success: true,
      course: courseResult,
      fileUrl: imageUrl,
      message: 'Course uploaded and created successfully'
    })

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 })
  }
}
