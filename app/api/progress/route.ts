import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    // Get user ID from Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabase
      .from('course_enrollments')
      .select(`
        *,
        courses(*),
        course_progress(*),
        quiz_attempts(
          *,
          quizzes(*)
        )
      `)
      .eq('user_id', userData.id)

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data: enrollments, error } = await query.order('enrolled_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate progress for each enrollment
    const enrichedEnrollments = enrollments?.map(enrollment => {
      const totalContent = enrollment.courses?.course_content?.length || 0
      const completedContent = enrollment.course_progress?.filter(p => p.completed).length || 0
      const actualProgress = totalContent > 0 ? (completedContent / totalContent) * 100 : 0

      // Calculate average quiz scores
      const quizScores = enrollment.quiz_attempts?.map(attempt => attempt.score) || []
      const averageScore = quizScores.length > 0 
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length 
        : 0

      return {
        ...enrollment,
        calculated_progress: Math.round(actualProgress),
        average_quiz_score: Math.round(averageScore),
        total_quizzes_taken: quizScores.length,
        last_activity: Math.max(
          ...[enrollment.last_accessed_at, ...quizScores.map(() => new Date().toISOString())]
        )
      }
    })

    return NextResponse.json(enrichedEnrollments)
  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, contentId, completed, timeSpent } = await request.json()

    // Get user ID from Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update course progress
    const { data: progress, error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: userData.id,
        course_id: courseId,
        content_id: contentId,
        completed: completed || false,
        completion_time: completed ? new Date().toISOString() : null,
        time_spent_minutes: timeSpent || 0
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update enrollment progress and last accessed
    const { data: allProgress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userData.id)
      .eq('course_id', courseId)

    const totalContent = await supabase
      .from('course_content')
      .select('id')
      .eq('course_id', courseId)

    const completedCount = allProgress?.filter(p => p.completed).length || 0
    const totalCount = totalContent.data?.length || 0
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    await supabase
      .from('course_enrollments')
      .update({
        progress_percentage: Math.round(progressPercentage),
        last_accessed_at: new Date().toISOString()
      })
      .eq('user_id', userData.id)
      .eq('course_id', courseId)

    // Update overall progress table
    await supabase
      .from('progress')
      .upsert({
        user_id: userData.id,
        course_id: courseId,
        content_id: contentId,
        subject: '', // Will be updated based on course
        topic: '', // Will be updated based on content
        mastery_level: Math.round(progressPercentage),
        time_spent: timeSpent || 0,
        last_accessed: new Date().toISOString()
      })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Update progress API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
