import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import {
  pushTrainingRecord,
  recordCourseCompletion,
  retryPendingRecords,
  verifyCronSecret,
} from '@/lib/qualisoft'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/qualisoft/sync
 *
 * Accès : administrateur (session Clerk) ou cron (Authorization: Bearer QUALISOFT_CRON_SECRET).
 *
 * Corps (action par défaut : retry) :
 *   { action: 'complete', userId, courseId, score }   → enregistre une complétion et la pousse
 *   { action: 'push', trainingRecordId }             → (re)pousse un enregistrement précis
 *   { action: 'retry', limit?, force? }              → batch : pending/failed dont le délai est échu
 */
const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('complete'),
    userId: z.string().uuid(),
    courseId: z.string().uuid(),
    score: z.number().min(0).max(100),
    completedAt: z.string().datetime().optional(),
  }),
  z.object({
    action: z.literal('push'),
    trainingRecordId: z.string().uuid(),
  }),
  z.object({
    action: z.literal('retry'),
    limit: z.number().int().min(1).max(200).optional(),
    force: z.boolean().optional(),
  }),
])

type Actor = { kind: 'cron' } | { kind: 'admin'; clerkId: string }

async function authorize(request: NextRequest): Promise<Actor | NextResponse> {
  if (verifyCronSecret(request)) return { kind: 'cron' }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const admin = await isAdmin(currentUser.id)
  if (!admin) {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
  }

  return { kind: 'admin', clerkId: currentUser.id }
}

/** GET = appel planifié (Vercel Cron / curl cron) : relance les synchros en attente. */
export async function GET(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const batch = await retryPendingRecords({ trigger: 'cron' })
    return NextResponse.json({ success: batch.failed === 0, ...batch })
  } catch (error: unknown) {
    console.error('Qualisoft cron sync error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await authorize(request)
    if (actor instanceof NextResponse) return actor

    let raw: unknown = {}
    try {
      raw = await request.json()
    } catch {
      raw = {} // corps vide accepté (appel cron minimal)
    }
    if (raw && typeof raw === 'object' && !('action' in raw)) {
      raw = { ...(raw as Record<string, unknown>), action: 'retry' }
    }

    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Requête invalide', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data

    switch (input.action) {
      case 'complete': {
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', input.userId)
          .single()

        if (userError || !userData) {
          return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
        }

        const record = await recordCourseCompletion({
          userId: input.userId,
          courseId: input.courseId,
          score: input.score,
          completedAt: input.completedAt,
        })
        const result = await pushTrainingRecord(record.id, { trigger: 'manual' })

        return NextResponse.json({
          success: result?.status === 'synced',
          trainingRecordId: record.id,
          result,
          message: result?.status === 'synced'
            ? 'Formation enregistrée et synchronisée avec QualiSoft'
            : 'Formation enregistrée, synchronisation en échec : elle sera retentée automatiquement',
        })
      }

      case 'push': {
        const result = await pushTrainingRecord(input.trainingRecordId, { trigger: 'manual' })
        if (!result) {
          return NextResponse.json({ error: 'Enregistrement de formation introuvable' }, { status: 404 })
        }

        return NextResponse.json({
          success: result.status === 'synced',
          result,
          message: result.status === 'synced'
            ? 'Synchronisation QualiSoft effectuée'
            : `Échec de la synchronisation : ${result.error ?? 'raison inconnue'}`,
        })
      }

      case 'retry': {
        const batch = await retryPendingRecords({
          limit: input.limit,
          force: actor.kind === 'admin' ? input.force : false,
          trigger: actor.kind === 'cron' ? 'cron' : 'batch',
        })

        return NextResponse.json({
          success: batch.failed === 0,
          ...batch,
          message: `${batch.processed} enregistrement(s) traité(s) : ${batch.synced} synchronisé(s), ${batch.failed} en échec`,
        })
      }
    }
  } catch (error: unknown) {
    console.error('Qualisoft sync API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
