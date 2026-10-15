import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { extractCourseContent } from '@/lib/course-extraction'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
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

    console.log('📤 Uploading course file:', { courseId, title, fileName: file.name, fileType: file.type })

    // Check if bucket exists and is accessible
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === 'course-images')
      
      if (!bucketExists) {
        console.log('⚠️ course-images bucket not found')
        console.log('📝 Please create bucket manually in Supabase Dashboard:')
        console.log('   - Name: course-images')
        console.log('   - Public: ✓')
        console.log('   - File size limit: 10485760')
        console.log('   - Allowed MIME types: image/jpeg,image/png,image/gif,image/webp,application/pdf')
      } else {
        console.log('✅ course-images bucket found')
      }
    } catch (error) {
      console.error('⚠️ Error checking bucket:', error)
      console.log('📝 Continuing with upload attempt...')
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${courseId}-${Date.now()}.${fileExt}`
    const filePath = `course-images/${fileName}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('course-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json({ error: `Failed to upload file: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('course-images')
      .getPublicUrl(filePath)

    const imageUrl = urlData.publicUrl

    // Create or update course record
    const courseData = {
      title,
      description,
      image_url: imageUrl,
      content_type: file.type === 'application/pdf' ? 'pdf' : 'image',
      extraction_status: 'pending',
      created_by: user.id,
      is_published: false,
      subject,
      level,
      difficulty,
      duration_hours,
      topics,
      learning_objectives,
      prerequisites
    }

    let courseResult

    if (courseId && courseId !== 'new') {
      // Update existing course
      const { data, error } = await supabaseAdmin
        .from('courses')
        .update(courseData)
        .eq('id', courseId)
        .select()

      if (error) {
        console.error('❌ Error updating course:', error)
        return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
      }

      courseResult = data
    } else {
      // Create new course
      const { data, error } = await supabaseAdmin
        .from('courses')
        .insert(courseData)
        .select()

      if (error) {
        console.error('❌ Error creating course:', error)
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
      }

      courseResult = data
    }

    console.log('✅ Course file uploaded successfully:', courseResult?.[0]?.id)

    // Extraction synchrone : fiable sur serverless (le setTimeout + self-fetch
    // est gelé dès la réponse renvoyée sur Vercel).
    const newId = courseResult?.[0]?.id
    if (newId && (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.pdf') || file.name.endsWith('.txt'))) {
      await extractCourseContent(newId, Buffer.from(await file.arrayBuffer()), file.name, file.type)
    }

    return NextResponse.json({
      success: true,
      course: courseResult?.[0],
      message: 'Course uploaded successfully'
    })

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    // Get course with extracted content
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (error || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get course images if this is an image-based course
    const courseImages: any[] = []
    if (course.content_type === 'image') {
      const { data: images, error: imagesError } = await supabase
        .from('course_images')
        .select('*')
        .eq('course_id', courseId)
        .order('page_number')

      if (!imagesError && images) {
        courseImages.push(...images)
      }
    }

    return NextResponse.json({
      course,
      courseImages,
      extractedContent: course.ai_extracted_content
    })

  } catch (error: any) {
    console.error('❌ Get course error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
