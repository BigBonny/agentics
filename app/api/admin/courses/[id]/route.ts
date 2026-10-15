import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function requireAdmin(): Promise<NextResponse | null> {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
  }
  return null
}

/**
 * GET /api/admin/courses/[id] — cours + chapitres (course_content triés), admin uniquement.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error?.code === 'PGRST116' || (!error && !course)) {
      return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 })
    }
    if (error) {
      console.error('Admin course fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: content, error: contentError } = await supabaseAdmin
      .from('course_content')
      .select('*')
      .eq('course_id', params.id)
      .order('order_index', { ascending: true })

    if (contentError) {
      console.error('Admin chapters fetch error:', contentError)
      return NextResponse.json(
        { ...course, chapters: [], chaptersError: contentError.message }
      )
    }

    return NextResponse.json({ ...course, chapters: content ?? [] })
  } catch (error) {
    console.error('Admin course detail error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  subject: z.string().optional(),
  level: z.number().int().min(0).max(10).optional(),
  difficulty: z.number().int().min(1).max(10).optional(),
  duration_hours: z.number().min(0).optional(),
  is_published: z.boolean().optional(),
})

/** PATCH /api/admin/courses/[id] — met à jour les métadonnées du cours. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const raw = await request.json()
    const parsed = patchSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide', details: parsed.error.flatten() }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin course PATCH error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
