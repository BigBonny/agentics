import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { clerk_id, email, first_name, last_name } = await request.json()

    // Un utilisateur ne peut synchroniser que son propre compte
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    if (clerk_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    }

    console.log('🔔 Sync user request:', { clerk_id, email, first_name, last_name })

    if (!clerk_id) {
      return NextResponse.json({ error: 'clerk_id is required' }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerk_id)
      .single()

    if (existingUser) {
      console.log('ℹ️ User already exists in database')
      return NextResponse.json({ success: true, message: 'User already exists' })
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        clerk_id,
        email,
        first_name,
        last_name,
        subscription_tier: 'free',
        subscription_status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ User created in database:', newUser)
    return NextResponse.json({ success: true, user: newUser })

  } catch (error: any) {
    console.error('Sync user error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
