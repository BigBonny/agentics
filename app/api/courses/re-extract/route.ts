import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    console.log('🔄 Re-triggering content extraction for course:', courseId)

    // Get course details
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Trigger AI content extraction
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/extract-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: course.id,
        imageUrl: course.image_url,
        contentType: course.content_type || 'pdf'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error triggering extraction:', error)
      return NextResponse.json({ error: 'Extraction failed', details: error }, { status: 500 })
    }

    const result = await response.json()
    console.log('✅ Extraction triggered successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Content extraction re-triggered successfully',
      result
    })

  } catch (error: any) {
    console.error('❌ Re-extraction error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
