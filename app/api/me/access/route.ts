import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'
import { hasCourseAccess } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

/** GET /api/me/access — droits d'accès de l'utilisateur courant (admin inclus). */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ isAdmin: false, hasAccess: false })
  }
  return NextResponse.json({
    isAdmin: await isAdmin(user.id),
    hasAccess: await hasCourseAccess(user.id),
  })
}
