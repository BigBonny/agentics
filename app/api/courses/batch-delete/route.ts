import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseIds } = await request.json()

    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json({ error: 'Invalid course IDs' }, { status: 400 })
    }

    console.log(`🗑️ Deleting courses: ${courseIds.join(', ')}`)

    // Delete course images from storage first
    for (const courseId of courseIds) {
      // Get course to find image URL
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('image_url')
        .eq('id', courseId)
        .single()

      if (course?.image_url) {
        // Extract file path from URL
        const urlParts = course.image_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        if (fileName) {
          // Delete from Supabase Storage
          const { error: storageError } = await supabaseAdmin.storage
            .from('course-images')
            .remove([fileName])

          if (storageError) {
            console.error('Error deleting file from storage:', storageError)
          } else {
            console.log(`✅ Deleted file from storage: ${fileName}`)
          }
        }
      }

      // Delete course images records
      await supabaseAdmin
        .from('course_images')
        .delete()
        .eq('course_id', courseId)

      // Delete course record
      await supabaseAdmin
        .from('courses')
        .delete()
        .eq('id', courseId)
    }

    console.log(`✅ Successfully deleted ${courseIds.length} courses`)

    return NextResponse.json({
      success: true,
      deletedCount: courseIds.length,
      message: `${courseIds.length} cours supprimés avec succès`
    })

  } catch (error: any) {
    console.error('❌ Error deleting courses:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
