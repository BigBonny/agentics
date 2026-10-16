import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { adminGate } from '@/lib/admin'
import { extractCourseContent } from '@/lib/course-extraction'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const denied = await adminGate()
    if (denied) return denied

    const { courseId } = await request.json()
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id, image_url, content_type')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    if (!course.image_url) {
      return NextResponse.json({ error: 'Aucun fichier associé à ce cours' }, { status: 400 })
    }

    // Re-télécharge le fichier depuis le bucket et relance l'extraction en direct
    const match = course.image_url.match(/\/object\/public\/course-images\/(.+)$/)
    const storagePath = match?.[1] ?? course.image_url.split('/').slice(-2).join('/')

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('course-images')
      .download(storagePath)

    if (downloadError || !fileData) {
      console.error('Re-extract download failed:', downloadError)
      return NextResponse.json({ error: 'Fichier introuvable dans le stockage' }, { status: 404 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const fileName = storagePath.split('/').pop() ?? 'fichier.pdf'

    const result = await extractCourseContent(courseId, buffer, fileName, course.content_type || 'pdf')

    return NextResponse.json({
      success: result.status === 'completed',
      extraction_status: result.status,
      extraction_error: result.error,
    })
  } catch (error: any) {
    console.error('❌ Re-extraction error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
