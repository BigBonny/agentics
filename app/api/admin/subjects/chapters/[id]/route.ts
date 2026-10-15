import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '../../route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  type_chapitre: z.string().nullable().optional(),
  duree_heures: z.number().min(0).nullable().optional(),
  objectifs: z.string().nullable().optional(),
  competences_visees: z.string().nullable().optional(),
  sequence: z.number().int().optional(),
})

/** PATCH /api/admin/subjects/chapters/[id] — met à jour un chapitre. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide', details: parsed.error.flatten() }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('subject_chapters')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Chapitre introuvable' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin chapter PATCH error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

/** DELETE /api/admin/subjects/chapters/[id] — supprime un chapitre (ses cours sont détachés). */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const { error } = await supabaseAdmin
      .from('subject_chapters')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin chapter DELETE error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
