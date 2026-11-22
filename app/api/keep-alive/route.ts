/**
 * Keep-alive : une requête minimale sur Supabase, appelée chaque jour par le
 * cron Vercel (vercel.json). Le plan gratuit Supabase met le projet en pause
 * après ~7 jours sans activité, ce qui coupe tout le site.
 * Route publique (ignorée par Clerk) : ne renvoie aucune donnée.
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { error } = await supabaseAdmin.from('subjects').select('id').limit(1)
  if (error) {
    console.error('[keep-alive] Supabase injoignable :', error.message)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}
