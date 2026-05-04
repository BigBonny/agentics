import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
  try {
    // Check if current user is admin
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin(currentUser.id)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get target user ID from request body
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the internal user ID from clerk_id
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      console.error('Error finding user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const internalUserId = userData.id

    // Get all courses
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id')

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json({ message: 'No courses found' })
    }

    const now = new Date().toISOString()
    const results = {
      enrollmentsUpdated: 0,
      progressRecordsCreated: 0,
      errors: [] as string[]
    }

    // Process each course
    for (const course of courses) {
      // 1. Update or create enrollment with 100% progress
      const { error: enrollmentError } = await supabaseAdmin
        .from('course_enrollments')
        .upsert({
          user_id: internalUserId,
          course_id: course.id,
          progress_percentage: 100,
          completed_at: now,
          last_accessed_at: now
        }, {
          onConflict: 'user_id,course_id'
        })

      if (enrollmentError) {
        console.error(`Error updating enrollment for course ${course.id}:`, enrollmentError)
        results.errors.push(`Course ${course.id}: ${enrollmentError.message}`)
        continue
      }
      results.enrollmentsUpdated++

      // 2. Get all content for this course
      const { data: contentItems, error: contentError } = await supabaseAdmin
        .from('course_content')
        .select('id')
        .eq('course_id', course.id)

      if (contentError) {
        console.error(`Error fetching content for course ${course.id}:`, contentError)
        continue
      }

      // 3. Mark all content as completed
      if (contentItems && contentItems.length > 0) {
        const progressRecords = contentItems.map(content => ({
          user_id: internalUserId,
          course_id: course.id,
          content_id: content.id,
          completed: true,
          completion_time: now,
          time_spent_minutes: 30 // Default time spent
        }))

        const { error: progressError } = await supabaseAdmin
          .from('course_progress')
          .upsert(progressRecords, {
            onConflict: 'user_id,content_id'
          })

        if (progressError) {
          console.error(`Error updating progress for course ${course.id}:`, progressError)
        } else {
          results.progressRecordsCreated += contentItems.length
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${results.enrollmentsUpdated} courses as completed`,
      details: results
    })

  } catch (error) {
    console.error('Complete all courses error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
