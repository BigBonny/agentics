import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const level = searchParams.get('level')
    const difficulty = searchParams.get('difficulty')

    let query = supabase
      .from('courses')
      .select('*')

    // Only show published courses to regular users
    query = query.eq('is_published', true)

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
  } catch (error: any) {
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

    const {
      title,
      description,
      subject,
      level,
      duration_hours,
      prerequisites,
      learning_objectives,
      topics,
      difficulty,
      is_published = false
    } = await request.json()

    // Validate required fields
    if (!title || !description || !subject) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: { title: !!title, description: !!description, subject: !!subject }
      }, { status: 400 })
    }

    console.log('Creating course:', { title, subject, level, difficulty })

    // Create course record
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        subject,
        level: parseInt(level?.toString()) || 5,
        duration_hours: parseInt(duration_hours?.toString()) || 10,
        prerequisites: prerequisites || [],
        learning_objectives: learning_objectives || [],
        topics: topics || [],
        difficulty: parseInt(difficulty?.toString()) || 5,
        created_by: user.id,
        is_published: is_published,
        content_type: 'text', // Default for manual courses
        extraction_status: 'completed' // Manual courses don't need extraction
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      return NextResponse.json({ 
        error: 'Failed to create course', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('Course created successfully:', course.id)
    return NextResponse.json(course)
  } catch (error: any) {
    console.error('Create course API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
