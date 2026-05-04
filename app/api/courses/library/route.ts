import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { canAccessCourseLibrary } from '@/lib/subscription'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const level = searchParams.get('level')
    const difficulty = searchParams.get('difficulty')

    // Check subscription for course library access
    const user = await getCurrentUser()
    const canAccess = await canAccessCourseLibrary(user?.id)

    if (!canAccess) {
      return NextResponse.json({
        error: 'Subscription required',
        needsSubscription: true,
        message: 'Subscribe to access our complete course library',
        previewCourses: await getPreviewCourses(subject, level, difficulty)
      }, { status: 403 })
    }

    let query = supabase
      .from('courses')
      .select('*')

    // Only show published courses
    query = query.eq('is_published', true)

    if (subject) {
      query = query.eq('subject', subject)
    }
    if (level) {
      query = query.eq('level', parseInt(level))
    }
    if (difficulty) {
      query = query.eq('difficulty', parseInt(difficulty))
    }

    const { data: courses, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Found courses for subscriber:', courses?.length || 0)
    return NextResponse.json({
      courses,
      hasAccess: true
    })

  } catch (error: any) {
    console.error('Course library error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function getPreviewCourses(subject?: string | null, level?: string | null, difficulty?: string | null) {
  // Return limited preview of courses for non-subscribers
  let query = supabase
    .from('courses')
    .select('id, title, subject, level, difficulty, duration_hours')
    .eq('is_published', true)
    .limit(3) // Only show 3 courses as preview

  if (subject) {
    query = query.eq('subject', subject)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}
