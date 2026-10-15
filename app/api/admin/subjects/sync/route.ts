import { NextResponse } from 'next/server'
import { requireAdmin } from '../route'
import { syncSubjectsFromQualisoft } from '@/lib/subjects'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** POST /api/admin/subjects/sync — réimporte matières + chapitres depuis QualiSoft. */
export async function POST() {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const result = await syncSubjectsFromQualisoft()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Subjects sync error:', error)
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
