import { NextResponse } from 'next/server'
import { buildSubjectsTree } from '@/lib/subjects'

export const dynamic = 'force-dynamic'

/** GET /api/subjects — arbre public formation → matières → chapitres → cours publiés. */
export async function GET() {
  try {
    const tree = await buildSubjectsTree(true)
    return NextResponse.json(tree)
  } catch (error) {
    console.error('Subjects tree error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
