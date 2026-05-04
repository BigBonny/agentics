import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Sample questions for guest quiz (same as frontend)
const sampleQuestions = [
  {
    id: 1,
    question: 'Quelle est la dérivée de f(x) = 3x² + 2x - 1 ?',
    options: ['f\'(x) = 6x + 2', 'f\'(x) = 3x + 2', 'f\'(x) = 6x', 'f\'(x) = 3x²'],
    correctAnswer: 'f\'(x) = 6x + 2'
  },
  {
    id: 2,
    question: 'Résolvez l\'équation: 2x + 5 = 13',
    options: ['x = 4', 'x = 8', 'x = 3', 'x = 6'],
    correctAnswer: 'x = 4'
  },
  {
    id: 3,
    question: 'Quelle est la valeur de sin(90°) ?',
    options: ['0', '1', '1/2', 'sqrt(2)/2'],
    correctAnswer: '1'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { quizId, answers } = await request.json()

    if (!quizId || !answers) {
      return NextResponse.json({ error: 'Quiz ID and answers are required' }, { status: 400 })
    }

    console.log('🎯 Guest quiz submission:', { quizId, answers })

    // Calculate score using sample questions
    let score = 0
    const totalQuestions = sampleQuestions.length
    
    sampleQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++
        console.log(`✅ Question ${index + 1} correct: ${answers[index]}`)
      } else {
        console.log(`❌ Question ${index + 1} wrong: ${answers[index]} (correct: ${question.correctAnswer})`)
      }
    })

    const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0

    console.log(`📊 Final score: ${score}/${totalQuestions} (${Math.round(scorePercentage)}%)`)

    // Return results for non-authenticated users
    const passed = scorePercentage >= 70
    const message = passed 
      ? 'Félicitations! Vous avez réussi le test!' 
      : 'Continuez à pratiquer! Abonnez-vous pour obtenir des recommandations détaillées.'

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      scorePercentage: Math.round(scorePercentage),
      passed,
      needsSubscription: true,
      message
    })

  } catch (error: any) {
    console.error('Guest quiz error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}
