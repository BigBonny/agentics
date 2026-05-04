import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function syncUserWithSupabase(userData?: any) {
  // If userData is provided (from webhook), use it
  if (userData) {
    try {
      // Check if user exists in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', userData.clerk_id)
        .single()

      if (!existingUser) {
        // Create new user in Supabase
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            clerk_id: userData.clerk_id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            subscription_tier: 'free',
            subscription_status: 'active'
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating user in Supabase:', error)
          return null
        }

        console.log('✅ User created in Supabase:', newUser)
        return newUser
      }

      console.log('ℹ️ User already exists in Supabase')
      return existingUser
    } catch (error) {
      console.error('Error syncing user with Supabase (webhook):', error)
      return null
    }
  }

  // Otherwise, get current user (for client-side calls)
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  try {
    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', user.id)
      .single()

    if (!existingUser) {
      // Create new user in Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          subscription_tier: 'free',
          subscription_status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user in Supabase:', error)
        return null
      }

      console.log('✅ User created in Supabase (client-side):', newUser)
      return newUser
    }

    // Update user info if needed
    const { data: updatedUser } = await supabase
      .from('users')
      .update({
        email: user.emailAddresses[0]?.emailAddress || existingUser.email,
        first_name: user.firstName || existingUser.first_name,
        last_name: user.lastName || existingUser.last_name,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', user.id)
      .select()
      .single()

    return updatedUser
  } catch (error) {
    console.error('Error syncing user with Supabase:', error)
    return null
  }
}

export async function deleteUserFromSupabase(clerkId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('clerk_id', clerkId)

    if (error) {
      console.error('Error deleting user from Supabase:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting user from Supabase:', error)
    return false
  }
}
