import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { AgenticsSystem } from '@/lib/ai-agents'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, userResponse, subject, difficulty } = await request.json()

    if (!question || !userResponse || !subject || difficulty === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check user subscription
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('clerk_id', user.id)
      .single()

    if (!userData || userData.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      )
    }

    // Process evaluation using AI agent
    const agentics = new AgenticsSystem()
    const result = await agentics.processUserRequest(user.id, {
      type: 'evaluation',
      data: {
        question,
        response: userResponse,
        subject,
        difficulty
      }
    })

    // Check if result is an EvaluationResult
    if (!result || typeof result === 'string' || !('score' in result)) {
      return NextResponse.json(
        { error: 'Invalid evaluation result' },
        { status: 500 }
      )
    }

    // Store evaluation result
    await supabase.from('evaluations').insert({
      user_id: user.id,
      subject,
      score: result.score,
      max_score: result.maxScore,
      responses: { question, userResponse },
      feedback: result.feedback
    })

    // Update progress based on evaluation
    await supabase.from('progress').upsert({
      user_id: user.id,
      subject,
      topic: extractTopicFromQuestion(question),
      mastery_level: calculateMasteryLevel(result.score, result.maxScore),
      last_accessed: new Date().toISOString(),
      time_spent: 0
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Evaluation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractTopicFromQuestion(question: string): string {
  // Simple topic extraction - in production, use more sophisticated NLP
  const topics = ['fonctions', 'dérivées', 'intégrales', 'algèbre', 'géométrie', 'probabilités', 'statistiques']
  const lowerQuestion = question.toLowerCase()
  
  for (const topic of topics) {
    if (lowerQuestion.includes(topic)) {
      return topic
    }
  }
  
  return 'général'
}

function calculateMasteryLevel(score: number, maxScore: number): number {
  const percentage = (score / maxScore) * 100
  return Math.round(percentage)
}
