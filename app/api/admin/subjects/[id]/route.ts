import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '../route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  code: z.string().nullable().optional(),
  formation_label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  duree_heures: z.number().min(0).nullable().optional(),
  semestre: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
})

/** PATCH /api/admin/subjects/[id] — met à jour une matière. */
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
      .from('subjects')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Matière introuvable' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin subject PATCH error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

/** DELETE /api/admin/subjects/[id] — supprime une matière locale (et ses chapitres). */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const { data: subject } = await supabaseAdmin
      .from('subjects')
      .select('source')
      .eq('id', params.id)
      .single()

    if (subject?.source === 'qualisoft') {
      return NextResponse.json(
        { error: 'Impossible de supprimer une matière QualiSoft — elle reviendra à la prochaine synchro. Dépubliez-la plutôt.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.from('subjects').delete().eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin subject DELETE error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
