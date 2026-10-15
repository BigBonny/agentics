import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '../../../route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** POST /api/admin/subjects/chapters/[id]/courses — rattache un cours au chapitre. */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const { courseId } = z.object({ courseId: z.string().uuid() }).parse(await request.json())

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({ chapter_id: params.id, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .select('id, title, chapter_id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }
    console.error('Attach course error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

/** DELETE /api/admin/subjects/chapters/[id]/courses?courseId=<uuid> — détache le cours. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const courseId = new URL(request.url).searchParams.get('courseId')
    if (!courseId) return NextResponse.json({ error: 'Paramètre courseId requis' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('courses')
      .update({ chapter_id: null, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .eq('chapter_id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Detach course error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
