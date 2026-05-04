import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { clerkId, subject, score, maxScore, responses, feedback } = await request.json()

    if (!clerkId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !userData) {
      console.error('User not found:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id

    // Save evaluation
    const { data: evaluation, error: evalError } = await supabaseAdmin
      .from('evaluations')
      .insert({
        user_id: userId,
        subject: subject || 'General',
        score: score || 0,
        max_score: maxScore || 0,
        responses: responses || [],
        feedback: feedback || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (evalError) {
      console.error('Error saving evaluation:', evalError)
      return NextResponse.json({ error: 'Failed to save evaluation', details: evalError.message }, { status: 500 })
    }

    // Update or create progress record
    const { error: progressError } = await supabaseAdmin
      .from('progress')
      .upsert({
        user_id: userId,
        subject: subject || 'General',
        topic: subject || 'General',
        mastery_level: Math.round((score / maxScore) * 100),
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,subject,topic'
      })

    if (progressError) {
      console.error('Error updating progress:', progressError)
      // Don't fail the request if progress update fails
    }

    return NextResponse.json({ 
      success: true, 
      evaluation,
      message: 'Quiz results saved successfully'
    })

  } catch (error: any) {
    console.error('Evaluations API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clerkId = searchParams.get('userId')

    if (!clerkId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id

    // Fetch evaluations
    const { data: evaluations, error: evalError } = await supabaseAdmin
      .from('evaluations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (evalError) {
      console.error('Error fetching evaluations:', evalError)
      return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 })
    }

    return NextResponse.json({ evaluations: evaluations || [] })

  } catch (error: any) {
    console.error('Evaluations API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}
