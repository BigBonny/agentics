import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabaseAdmin } from '@/lib/supabase'

async function resolveDbUser(clerkId: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()
  return data?.id ?? null
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { courseId, quizResult } = await request.json()
    if (!courseId || !quizResult) {
      return NextResponse.json({ error: 'courseId et quizResult requis' }, { status: 400 })
    }

    const userId = await resolveDbUser(sessionUser.id)
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const row = {
      user_id: userId,
      course_id: courseId,
      quiz_score: quizResult.percentage,
      last_quiz_date: new Date().toISOString(),
      total_time_spent: quizResult.time_taken,
      weaknesses: quizResult.weaknesses,
      strengths: quizResult.strengths,
      completion_percentage: quizResult.percentage,
      updated_at: new Date().toISOString(),
    }

    // Pas de contrainte unique (user_id, course_id) → update puis insert si absent
    const { data: existing } = await supabaseAdmin
      .from('progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .limit(1)

    const { error } = existing?.length
      ? await supabaseAdmin.from('progress').update(row).eq('id', existing[0].id)
      : await supabaseAdmin.from('progress').insert(row)

    if (error) {
      console.error('Progress write error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating user progress:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = await resolveDbUser(sessionUser.id)
    if (!userId) {
      return NextResponse.json({
        progress: [],
        stats: { total_quizzes_taken: 0, average_score: 0, total_study_time: 0 },
      })
    }

    const { data: progress, error } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching progress:', error)
      return NextResponse.json({
        progress: [],
        stats: { total_quizzes_taken: 0, average_score: 0, total_study_time: 0 },
      })
    }

    const rows = progress ?? []
    return NextResponse.json({
      progress: rows,
      stats: {
        total_quizzes_taken: rows.length,
        average_score: rows.length
          ? Math.round(rows.reduce((s: number, p: any) => s + (p.quiz_score || 0), 0) / rows.length)
          : 0,
        total_study_time: rows.reduce((s: number, p: any) => s + (p.total_time_spent || 0), 0),
      },
    })
  } catch (error: any) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
