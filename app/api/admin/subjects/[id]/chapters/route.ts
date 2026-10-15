import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '../../route'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const createSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  type_chapitre: z.string().optional(),
  duree_heures: z.number().min(0).optional(),
  objectifs: z.string().optional(),
  competences_visees: z.string().optional(),
  parent_id: z.string().uuid().optional(),
})

/** POST /api/admin/subjects/[id]/chapters — ajoute un chapitre local à la matière. */
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
      .from('subject_chapters')
      .select('sequence')
      .eq('subject_id', params.id)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data, error } = await supabaseAdmin
      .from('subject_chapters')
      .insert({
        subject_id: params.id,
        sequence: ((last?.sequence ?? 0) as number) + 10,
        source: 'agentics',
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
