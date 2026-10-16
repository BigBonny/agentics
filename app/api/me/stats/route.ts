import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/me/stats — données du dashboard côté serveur (jamais de supabaseAdmin
// dans un composant 'use client' : la clé service-role serait exposée au navigateur).
export async function GET() {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const email = sessionUser.emailAddresses[0]?.emailAddress ?? ''

    // Crée ou récupère la ligne users correspondant au compte Clerk
    let { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', sessionUser.id)
      .single()

    if (!userData) {
      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: sessionUser.id,
          email,
          first_name: sessionUser.firstName ?? '',
          last_name: sessionUser.lastName ?? '',
          subscription_tier: 'free',
          subscription_status: 'active',
        })
        .select()
        .single()
      userData = newUser
    }

    if (!userData) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const userId = userData.id
    const [{ data: evaluations }, { data: progressData }, { data: studySessions }] =
      await Promise.all([
        supabaseAdmin
          .from('evaluations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabaseAdmin.from('progress').select('*').eq('user_id', userId),
        supabaseAdmin.from('study_sessions').select('*').eq('user_id', userId),
      ])

    const evals = evaluations ?? []
    const totalQuizzes = evals.length
    const averageScore =
      totalQuizzes > 0
        ? Math.round(
            evals.reduce((s: number, e: any) => s + (e.max_score ? (e.score / e.max_score) * 100 : 0), 0) /
              totalQuizzes
          )
        : 0

    const studyTimeMinutes = (studySessions ?? []).reduce(
      (s: number, x: any) => s + (x.duration || 0),
      0
    )

    const weaknesses: string[] = []
    const strengths: string[] = []
    for (const p of progressData ?? []) {
      if (p.mastery_level < 50 && p.topic) weaknesses.push(p.topic)
      else if (p.mastery_level > 75 && p.topic) strengths.push(p.topic)
    }

    const weeklyProgress = [
      { day: 'Lun', score: 0 },
      { day: 'Mar', score: 0 },
      { day: 'Mer', score: 0 },
      { day: 'Jeu', score: 0 },
      { day: 'Ven', score: 0 },
      { day: 'Sam', score: 0 },
      { day: 'Dim', score: 0 },
    ]
    evals.slice(0, 7).forEach((e: any, index: number) => {
      const dayIndex = 6 - index
      if (dayIndex >= 0 && e.max_score) {
        weeklyProgress[dayIndex].score = Math.round((e.score / e.max_score) * 100)
      }
    })

    return NextResponse.json({
      user: userData,
      stats: {
        averageScore,
        totalQuizzes,
        studyTime: Math.round(studyTimeMinutes / 60),
        streak: Math.min(totalQuizzes, 7),
        weeklyProgress,
        weaknesses: Array.from(new Set(weaknesses)).slice(0, 5),
        strengths: Array.from(new Set(strengths)).slice(0, 5),
      },
    })
  } catch (error: any) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
