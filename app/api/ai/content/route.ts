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

    const { query, subject, userLevel, conceptualGaps } = await request.json()

    if (!query || !subject || userLevel === undefined) {
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

    // Get user's progress to identify conceptual gaps
    const { data: userProgress } = await supabase
      .from('progress')
      .select('topic, mastery_level')
      .eq('user_id', user.id)
      .eq('subject', subject)

    const identifiedGaps = userProgress
      ? userProgress
          .filter(p => p.mastery_level < 60)
          .map(p => p.topic)
      : []

    // Process content request using AI agent
    const agentics = new AgenticsSystem()
    const result = await agentics.processUserRequest(user.id, {
      type: 'content',
      data: {
        query,
        subject,
        userLevel,
        conceptualGaps: [...(conceptualGaps || []), ...identifiedGaps]
      }
    })

    // Log study session
    await supabase.from('study_sessions').insert({
      user_id: user.id,
      subject,
      topic: extractTopicFromQuery(query),
      duration: 0, // Will be updated when session ends
      activities: {
        type: 'content_request',
        query,
        result_count: Array.isArray(result) ? result.length : 1
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractTopicFromQuery(query: string): string {
  // Simple topic extraction - in production, use more sophisticated NLP
  const topics = ['fonctions', 'dérivées', 'intégrales', 'algèbre', 'géométrie', 'probabilités', 'statistiques']
  const lowerQuery = query.toLowerCase()
  
  for (const topic of topics) {
    if (lowerQuery.includes(topic)) {
      return topic
    }
  }
  
  return 'général'
}
