import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    // Skip authentication for now - just return courses
    console.log('Fetching courses (no auth check for testing)')

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const level = searchParams.get('level')
    const difficulty = searchParams.get('difficulty')

    let query = supabaseAdmin
      .from('courses')
      .select('*')

    // Show all courses including unpublished ones
    // query = query.eq('is_published', true)

    if (subject) {
      query = query.eq('subject', subject)
    }
    if (level) {
      query = query.eq('level', parseInt(level))
    }
    if (difficulty) {
      query = query.eq('difficulty', parseInt(difficulty))
    }

    const { data: courses, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Found courses:', courses?.length || 0)
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Courses API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create courses
    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const {
      title,
      description,
      subject,
      level,
      duration_hours,
      prerequisites,
      learning_objectives,
      topics,
      difficulty
    } = await request.json()

    // Get or create user record in Supabase
    let userData = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData.data) {
      // Create user record if it doesn't exist
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          subscription_tier: 'free',
          subscription_status: 'active'
        })
        .select('id')
        .single()

      if (createUserError) {
        console.error('Error creating user record:', createUserError)
        return NextResponse.json({ error: 'Failed to create user record', details: createUserError.message }, { status: 500 })
      }
      userData = { data: newUser, error: null, count: null, status: 200, statusText: 'OK' }
    }

    const userId = userData.data?.id
    if (!userId) {
      return NextResponse.json({ error: 'Failed to get user ID' }, { status: 500 })
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert({
        title,
        description,
        subject,
        level,
        duration_hours,
        prerequisites: prerequisites || [],
        learning_objectives: learning_objectives || [],
        topics: topics || [],
        difficulty,
        created_by: userId,
        is_published: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Course created successfully:', course)
    return NextResponse.json(course)
  } catch (error) {
    console.error('Create course API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
