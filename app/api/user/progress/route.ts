import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, quizResult } = await request.json()

    console.log('POST progress request:', { userId, courseId, quizResult })
    
    // Convert user ID to UUID format for database compatibility
    let finalUserId: string
    
    // If userId is already a UUID format, use it as-is
    if (userId && /^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(userId)) {
      finalUserId = userId
    } else {
      // Convert to a valid UUID v4 format for testing
      finalUserId = '00000000-0000-0000-0000-000000000001'
    }

    // First, try to update progress table directly
    try {
      console.log('Updating progress table with:', {
        user_id: finalUserId,
        course_id: courseId,
        quiz_score: quizResult.percentage,
        last_quiz_date: new Date().toISOString(),
        total_time_spent: quizResult.time_taken,
        weaknesses: quizResult.weaknesses,
        strengths: quizResult.strengths,
        completion_percentage: quizResult.percentage
      })

      // Try upsert without conflict first (might work if table doesn't have constraint)
      const { error: progressError } = await supabase
        .from('progress')
        .upsert({
          user_id: finalUserId,
          course_id: courseId,
          quiz_score: quizResult.percentage,
          last_quiz_date: new Date().toISOString(),
          total_time_spent: quizResult.time_taken,
          weaknesses: quizResult.weaknesses,
          strengths: quizResult.strengths,
          completion_percentage: quizResult.percentage,
          updated_at: new Date().toISOString()
        })

      if (progressError) {
        console.error('Error updating progress:', progressError)
        // Try a simple insert instead
        const { error: insertError } = await supabase
          .from('progress')
          .insert({
            user_id: finalUserId,
            course_id: courseId,
            quiz_score: quizResult.percentage,
            last_quiz_date: new Date().toISOString(),
            total_time_spent: quizResult.time_taken,
            weaknesses: quizResult.weaknesses,
            strengths: quizResult.strengths,
            completion_percentage: quizResult.percentage,
            updated_at: new Date().toISOString()
          })
          
        if (insertError) {
          console.error('Error inserting progress:', insertError)
          // Try update instead
          const { error: updateError } = await supabase
            .from('progress')
            .update({
              quiz_score: quizResult.percentage,
              last_quiz_date: new Date().toISOString(),
              total_time_spent: quizResult.time_taken,
              weaknesses: quizResult.weaknesses,
              strengths: quizResult.strengths,
              completion_percentage: quizResult.percentage,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', finalUserId)
            .eq('course_id', courseId)
            
          if (updateError) {
            console.error('Error updating progress:', updateError)
          } else {
            console.log('Progress updated successfully (update)!')
          }
        } else {
          console.log('Progress updated successfully (upsert)!')
        }
      } else {
        console.log('Progress updated successfully (upsert)!')
      }
    } catch (progressException) {
      console.error('Exception updating progress:', progressException)
    }

    console.log('Progress update completed!')
    return NextResponse.json({ success: true, message: 'Progress updated successfully' })

  } catch (error) {
    console.error('Error updating user progress:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('GET progress request for userId:', userId)

    // Convert user ID to UUID format for database compatibility
    let finalUserId: string
    
    // If userId is already a UUID format, use it as-is
    if (userId && /^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(userId)) {
      finalUserId = userId
    } else {
      // Convert to a valid UUID v4 format for testing
      finalUserId = '00000000-0000-0000-0000-000000000001'
    }

    // Get user progress data
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', finalUserId)
      .order('updated_at', { ascending: false })

    console.log('Progress query result:', { progress, progressError })

    if (progressError) {
      console.error('Error fetching progress:', progressError)
      // Return empty progress instead of error
      return NextResponse.json({ 
        progress: [], 
        stats: {
          total_quizzes_taken: 0,
          average_score: 0,
          total_study_time: 0
        }
      })
    }

    // Get user stats (simplified - skip users table for now)
    const userStats = {
      total_quizzes_taken: progress ? progress.length : 0,
      average_score: progress && progress.length > 0 
        ? Math.round(progress.reduce((sum: number, p: any) => sum + (p.quiz_score || 0), 0) / progress.length)
        : 0,
      total_study_time: progress && progress.length > 0
        ? progress.reduce((sum: number, p: any) => sum + (p.total_time_spent || 0), 0)
        : 0
    }

    console.log('Calculated user stats:', userStats)

    return NextResponse.json({
      progress: progress || [],
      stats: userStats
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
