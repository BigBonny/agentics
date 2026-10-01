import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CHAPTER_TYPES = ['lesson', 'exercise', 'video', 'reading'] as const

async function requireAdmin(): Promise<NextResponse | null> {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
  }
  return null
}

const createSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().default(''),
  type: z.enum(CHAPTER_TYPES).default('lesson'),
  duration_minutes: z.number().int().min(0).optional(),
})

/** POST /api/admin/courses/[id]/content — ajoute un chapitre (en fin de cours). */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide', details: parsed.error.flatten() }, { status: 400 })
    }

    const { data: last } = await supabaseAdmin
      .from('course_content')
      .select('order_index')
      .eq('course_id', params.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data, error } = await supabaseAdmin
      .from('course_content')
      .insert({
        course_id: params.id,
        order_index: (last?.order_index ?? 0) + 1,
        ...parsed.data,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Admin chapter POST error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

const patchSchema = z.object({
  contentId: z.string().uuid(),
  title: z.string().trim().min(1).optional(),
  content: z.string().optional(),
  type: z.enum(CHAPTER_TYPES).optional(),
  duration_minutes: z.number().int().min(0).optional(),
  order_index: z.number().int().min(0).optional(),
})

/** PATCH /api/admin/courses/[id]/content — met à jour un chapitre (dont son ordre). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const { contentId, ...fields } = patchSchema.parse(await request.json())

    const { data, error } = await supabaseAdmin
      .from('course_content')
      .update(fields)
      .eq('id', contentId)
      .eq('course_id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Chapitre introuvable' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Requête invalide', details: error.flatten() }, { status: 400 })
    }
    console.error('Admin chapter PATCH error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

/** DELETE /api/admin/courses/[id]/content?contentId=<uuid> — supprime un chapitre. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const contentId = new URL(request.url).searchParams.get('contentId')
    if (!contentId) {
      return NextResponse.json({ error: 'Paramètre contentId requis' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('course_content')
      .delete()
      .eq('id', contentId)
      .eq('course_id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin chapter DELETE error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
