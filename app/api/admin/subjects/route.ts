import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSubjectsTree } from '@/lib/subjects'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
  }
  return null
}

/** GET /api/admin/subjects — arbre complet (incl. non publié) + liste des cours rattachables. */
export async function GET() {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const [tree, coursesRes] = await Promise.all([
      buildSubjectsTree(false),
      supabaseAdmin
        .from('courses')
        .select('id, title, subject, is_published, chapter_id')
        .order('title'),
    ])

    if (coursesRes.error) return NextResponse.json({ error: coursesRes.error.message }, { status: 500 })
    return NextResponse.json({ tree, courses: coursesRes.data ?? [] })
  } catch (error) {
    console.error('Admin subjects GET error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().optional(),
  formation_label: z.string().trim().optional(),
  description: z.string().optional(),
  duree_heures: z.number().min(0).optional(),
  semestre: z.string().optional(),
  is_published: z.boolean().default(true),
})

/** POST /api/admin/subjects — crée une matière locale (non synchronisée). */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide', details: parsed.error.flatten() }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert({ ...parsed.data, source: 'agentics' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Admin subject POST error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
