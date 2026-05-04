import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { canAccessRecommendations } from '@/lib/subscription'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { quizId, score, answers } = await request.json()

    if (!quizId || score === undefined) {
      return NextResponse.json({ error: 'Quiz ID and score are required' }, { status: 400 })
    }

    // Check subscription for recommendations
    const user = await getCurrentUser()
    const canAccess = await canAccessRecommendations(user?.id)

    if (!canAccess) {
      return NextResponse.json({
        error: 'Subscription required',
        needsSubscription: true,
        message: 'Subscribe to access personalized recommendations and course library'
      }, { status: 403 })
    }

    // Get all published courses from database
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('level', { ascending: true })

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
    }

    // Generate recommendations based on quiz score and available courses
    const recommendations = generateRecommendations(score, courses || [])

    return NextResponse.json({
      success: true,
      recommendations,
      courses: courses || [],
      message: 'Personalized recommendations generated successfully'
    })

  } catch (error: any) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

function generateRecommendations(score: number, courses: any[]) {
  const totalQuestions = 3 // Assuming 3 questions from guest quiz
  const scorePercentage = (score / totalQuestions) * 100

  // Determine weak and strong subjects based on score
  const weakSubjects: string[] = []
  const strongSubjects: string[] = []

  if (scorePercentage < 70) {
    weakSubjects.push('mathématiques')
    strongSubjects.push('général')
  } else {
    weakSubjects.push('général')
    strongSubjects.push('mathématiques')
  }

  // Determine recommended level based on score
  let recommendedLevel = 6 // Default level 6
  if (scorePercentage < 60) {
    recommendedLevel = 5
  } else if (scorePercentage > 85) {
    recommendedLevel = 7
  }

  // Filter and recommend courses based on level and subjects
  const recommendedCourses = courses.filter(course => 
    course.level <= recommendedLevel && 
    course.subject === 'mathématiques'
  ).slice(0, 3)

  return {
    score,
    totalQuestions,
    scorePercentage: Math.round(scorePercentage),
    performance: scorePercentage >= 70 ? 'good' : scorePercentage >= 50 ? 'average' : 'needs_improvement',
    weakSubjects: Array.from(new Set(weakSubjects)),
    strongSubjects: Array.from(new Set(strongSubjects)),
    recommendedLevel,
    recommendedCourses,
    studyTips: generateStudyTips(scorePercentage, weakSubjects),
    estimatedImprovementTime: calculateImprovementTime(scorePercentage)
  }
}

function generateStudyTips(scorePercentage: number, weakSubjects: string[]): string[] {
  const tips: string[] = []

  if (scorePercentage < 50) {
    tips.push('Focus on fundamental concepts before moving to advanced topics')
    tips.push('Practice with easier problems to build confidence')
    tips.push('Consider basic courses in your weak areas')
  } else if (scorePercentage < 70) {
    tips.push('Review incorrect answers and understand why they were wrong')
    tips.push('Practice mixed problems to improve application skills')
    tips.push('Take intermediate courses in weak subjects')
  } else {
    tips.push('Challenge yourself with advanced problems')
    tips.push('Teach others to reinforce your understanding')
    tips.push('Explore specialized topics in strong areas')
  }

  if (weakSubjects.length > 0) {
    tips.push(`Pay special attention to: ${weakSubjects.join(', ')}`)
  }

  return tips
}

function calculateImprovementTime(scorePercentage: number): string {
  if (scorePercentage >= 70) return '2-4 weeks'
  if (scorePercentage >= 50) return '4-8 weeks'
  return '8-12 weeks'
}
