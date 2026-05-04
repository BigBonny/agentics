import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/clerk'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from Supabase
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id

    // Fetch user's progress data
    const { data: progressData } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)

    // Fetch evaluations
    const { data: evaluations } = await supabaseAdmin
      .from('evaluations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Fetch available courses
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('*')
      .limit(20)

    // Identify weaknesses and strengths
    const weaknesses: string[] = []
    const strengths: string[] = []
    
    progressData?.forEach((p: any) => {
      if (p.mastery_level < 50) {
        weaknesses.push(p.topic || p.subject)
      } else if (p.mastery_level > 75) {
        strengths.push(p.topic || p.subject)
      }
    })

    // Also extract from evaluations feedback
    evaluations?.forEach((e: any) => {
      if (e.feedback?.weaknesses) {
        weaknesses.push(...e.feedback.weaknesses)
      }
      if (e.feedback?.strengths) {
        strengths.push(...e.feedback.strengths)
      }
    })

    // Remove duplicates
    const uniqueWeaknesses = Array.from(new Set(weaknesses)).slice(0, 5)
    const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 5)

    // Generate recommendations based on weaknesses
    const recommendations: any[] = []

    // If user has weaknesses, recommend courses to address them
    if (uniqueWeaknesses.length > 0) {
      for (const weakness of uniqueWeaknesses) {
        // Find relevant courses
        const relevantCourses = courses?.filter((c: any) => 
          c.subject?.toLowerCase().includes(weakness.toLowerCase()) ||
          c.title?.toLowerCase().includes(weakness.toLowerCase()) ||
          c.description?.toLowerCase().includes(weakness.toLowerCase())
        ) || []

        if (relevantCourses.length > 0) {
          recommendations.push({
            type: 'course',
            priority: 'high',
            reason: `Renforcer vos compétences en ${weakness}`,
            course: relevantCourses[0],
            weakness
          })
        }
      }
    }

    // If user has strengths, suggest advanced content
    if (uniqueStrengths.length > 0) {
      recommendations.push({
        type: 'exercise',
        priority: 'medium',
      reason: `Approfondir vos forces: ${uniqueStrengths.join(', ')}`,
        message: 'Continuez à pratiquer pour maintenir votre niveau élevé'
      })
    }

    // Always suggest a practice quiz
    recommendations.push({
      type: 'quiz',
      priority: 'medium',
      reason: 'Quiz de pratique recommandé',
      action: '/quiz/guest',
      message: 'Testez vos connaissances avec un quiz adaptatif'
    })

    return NextResponse.json({
      recommendations: recommendations.slice(0, 5),
      weaknesses: uniqueWeaknesses,
      strengths: uniqueStrengths,
      totalQuizzes: evaluations?.length || 0,
      averageScore: evaluations && evaluations.length > 0
        ? Math.round(evaluations.reduce((sum: number, e: any) => sum + (e.score / e.max_score * 100), 0) / evaluations.length)
        : 0
    })

  } catch (error: any) {
    console.error('Recommendations API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
