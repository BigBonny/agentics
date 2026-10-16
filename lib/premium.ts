'use client'

import { useEffect, useState } from 'react'

/**
 * Vérification premium côté client (UX uniquement — le vrai contrôle est
 * fait côté serveur via hasCourseAccess). Lit publicMetadata.subscription,
 * maintenu par le webhook Stripe.
 */
export function isPremiumMetadata(metadata: unknown): boolean {
  const sub = (metadata as any)?.subscription
  if (!sub) return false
  return sub.status === 'active' && ['premium', 'center'].includes(sub.tier)
}

/**
 * Hook client : accès premium OU admin (via /api/me/access, source de vérité
 * serveur). Fallback sur le metadata Clerk tant que la requête charge.
 */
export function useCourseAccess(publicMetadata: unknown): boolean {
  const [access, setAccess] = useState(() => isPremiumMetadata(publicMetadata))
  useEffect(() => {
    let alive = true
    fetch('/api/me/access')
      .then((r) => r.json())
      .then((d) => {
        if (alive && (d.hasAccess || d.isAdmin)) setAccess(true)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])
  return access
}
