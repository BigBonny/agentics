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
