import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/clerk'
import { isAdmin } from '@/lib/admin'

export async function getUserSubscription(userId?: string) {
  if (!userId) {
    const user = await getCurrentUser()
    userId = user?.id
  }

  if (!userId) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, stripe_customer_id')
    .eq('clerk_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function hasActiveSubscription(userId?: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return false
  }

  return subscription.subscription_status === 'active' && 
         ['premium', 'center'].includes(subscription.subscription_tier)
}

export async function requireSubscription(userId?: string): Promise<boolean> {
  const hasSub = await hasActiveSubscription(userId)
  
  if (!hasSub) {
    throw new Error('Active subscription required')
  }
  
  return true
}

/** Accès au contenu des cours : premium/center actif OU admin (prévisualisation). */
export async function hasCourseAccess(userId?: string): Promise<boolean> {
  if (!userId) return false
  if (await isAdmin(userId)) return true
  return hasActiveSubscription(userId)
}

export async function canAccessRecommendations(userId?: string): Promise<boolean> {
  return await hasCourseAccess(userId)
}

export async function canAccessCourseLibrary(userId?: string): Promise<boolean> {
  return await hasCourseAccess(userId)
}
