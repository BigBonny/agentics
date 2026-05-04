import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function getCurrentUser() {
  const user = await currentUser()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return user
}

export async function getUserSubscription(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId)
    const subscription = user.publicMetadata.subscription as any
    return subscription
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
}

export async function updateUserSubscription(userId: string, subscriptionData: any) {
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        subscription: subscriptionData
      }
    })
    return true
  } catch (error) {
    console.error('Error updating user subscription:', error)
    return false
  }
}
