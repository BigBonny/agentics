import { getCurrentUser } from '@/lib/clerk'

// Admin user IDs - add your Clerk user IDs here
export const ADMIN_USER_IDS = [
  'user_3BCVh2jkLqNoCZbFCLI0kfK8Dol',
  'user_3DEggFUNlD2npcMAheiWXk0kVFY'
]

export async function isAdmin(userId?: string): Promise<boolean> {
  if (!userId) {
    const user = await getCurrentUser()
    userId = user?.id
  }
  
  return ADMIN_USER_IDS.includes(userId || '')
}

export async function requireAdmin(userId?: string): Promise<boolean> {
  const admin = await isAdmin(userId)
  if (!admin) {
    throw new Error('Admin access required')
  }
  return true
}
