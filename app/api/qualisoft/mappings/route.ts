import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { upsertCourseMapping, getQualisoftConfig, verifyCronSecret } from '@/lib/qualisoft'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET/POST /api/qualisoft/mappings — correspondances cours Agentics ↔ code formation QualiSoft.
 * Accès : administrateur (session Clerk) ou cron (Bearer QUALISOFT_CRON_SECRET) en lecture seule.
 */
async function requireAdmin(): Promise<NextResponse | null> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  if (!(await isAdmin(currentUser.id))) {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
  }
  return null
}

async function fetchQualisoftFormations() {
  const cfg = getQualisoftConfig()
  if (!cfg.apiUrl || !cfg.apiKey) return null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `bearer ${cfg.apiKey}`,
  }
  if (cfg.db) headers['X-Odoo-Database'] = cfg.db

  try {
    const response = await fetch(`${cfg.apiUrl}/json/2/of.formation/search_read`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ domain: [['active', '=', true]], fields: ['id', 'name', 'code'], order: 'code' }),
      cache: 'no-store',
    })
    if (!response.ok) return null
    return (await response.json()) as Array<{ id: number; name: string; code: string }>
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const cron = verifyCronSecret(request)
  if (!cron) {
    const denied = await requireAdmin()
    if (denied) return denied
  }

  const [{ data: mappings, error }, { data: courses }, formations] = await Promise.all([
    supabaseAdmin.from('qualisoft_course_mappings').select('*').order('qualisoft_formation_code'),
    supabaseAdmin.from('courses').select('id, title').order('title'),
    fetchQualisoftFormations(),
  ])

  if (error) return NextResponse.json({ error: 'Lecture des correspondances impossible' }, { status: 500 })

  return NextResponse.json({ mappings: mappings ?? [], courses: courses ?? [], qualisoftFormations: formations })
}

const upsertSchema = z.object({
  courseId: z.string().uuid(),
  formationCode: z.string().trim().min(1),
  label: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const parsed = upsertSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requête invalide', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', parsed.data.courseId)
    .maybeSingle()
  if (!course) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 })

  try {
    await upsertCourseMapping(parsed.data.courseId, parsed.data.formationCode, parsed.data.label)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }

  if (parsed.data.isActive === false) {
    await supabaseAdmin
      .from('qualisoft_course_mappings')
      .update({ is_active: false })
      .eq('course_id', parsed.data.courseId)
  }

  return NextResponse.json({ success: true })
}
