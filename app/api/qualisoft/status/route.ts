import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { getPublicQualisoftConfig, verifyCronSecret, type SyncStatus } from '@/lib/qualisoft'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STATUSES: SyncStatus[] = ['pending', 'synced', 'failed']

/**
 * GET /api/qualisoft/status
 *
 * Accès : administrateur ou cron (supervision).
 * Paramètres : status (pending|synced|failed), userId (UUID interne), limit (≤ 200, défaut 50), offset.
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
      }
      const admin = await isAdmin(currentUser.id)
      if (!admin) {
        return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const userIdParam = searchParams.get('userId')
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get('limit') ?? '50', 10) || 50, 1), 200)
    const offset = Math.max(Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0)

    if (statusParam && !STATUSES.includes(statusParam as SyncStatus)) {
      return NextResponse.json(
        { error: 'Paramètre status invalide (pending, synced ou failed attendu)' },
        { status: 400 }
      )
    }

    // 1. Compteurs par statut
    const counts = await Promise.all(
      STATUSES.map(async (status) => {
        const { count, error } = await supabaseAdmin
          .from('training_records')
          .select('id', { count: 'exact', head: true })
          .eq('sync_status', status)
        if (error) throw new Error(`Comptage ${status} impossible : ${error.message}`)
        return [status, count ?? 0] as const
      })
    )
    const countsByStatus = Object.fromEntries(counts) as Record<SyncStatus, number>

    // 2. Liste paginée des enregistrements
    let recordsQuery = supabaseAdmin
      .from('training_records')
      .select(
        `id, user_id, course_id, course_title, qualisoft_formation_code, score, completed_at,
         certificate_url, sync_status, sync_target, qualisoft_record_ref, sync_attempts,
         next_retry_at, synced_at, sync_error, created_at, updated_at,
         users(email, first_name, last_name)`,
        { count: 'exact' }
      )

    if (statusParam) recordsQuery = recordsQuery.eq('sync_status', statusParam)
    if (userIdParam) recordsQuery = recordsQuery.eq('user_id', userIdParam)

    const { data: records, count: filteredCount, error: recordsError } = await recordsQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (recordsError) {
      console.error('Error fetching training records:', recordsError)
      return NextResponse.json({ error: 'Impossible de lire les enregistrements de formation' }, { status: 500 })
    }

    // 3. Cours publiés sans correspondance QualiSoft (bloquent la synchro)
    const [{ data: publishedCourses }, { data: mappings }] = await Promise.all([
      supabaseAdmin.from('courses').select('id, title').eq('is_published', true),
      supabaseAdmin.from('qualisoft_course_mappings').select('course_id').eq('is_active', true),
    ])
    const mappedIds = new Set(((mappings ?? []) as Array<{ course_id: string }>).map((m) => m.course_id))
    const unmappedCourses = ((publishedCourses ?? []) as Array<{ id: string; title: string }>).filter(
      (course) => !mappedIds.has(course.id)
    )

    // 4. Dernières entrées du journal d'audit
    const { data: recentLogs, error: logsError } = await supabaseAdmin
      .from('qualisoft_sync_logs')
      .select('id, training_record_id, triggered_by, mode, success, http_status, error, qualisoft_record_ref, duration_ms, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (logsError) console.error('Error fetching qualisoft sync logs:', logsError)

    const total = countsByStatus.pending + countsByStatus.synced + countsByStatus.failed

    return NextResponse.json({
      config: getPublicQualisoftConfig(),
      counts: { ...countsByStatus, total },
      syncRate: total > 0 ? Math.round((countsByStatus.synced / total) * 1000) / 10 : null,
      unmappedCourses: {
        count: unmappedCourses.length,
        courses: unmappedCourses.slice(0, 50),
      },
      records: records ?? [],
      pagination: { limit, offset, total: filteredCount ?? 0 },
      recentLogs: recentLogs ?? [],
    })
  } catch (error: unknown) {
    console.error('Qualisoft status API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
