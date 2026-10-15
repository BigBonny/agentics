import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { getCurrentUser } from '@/lib/clerk'
import { extractCourseContent } from '@/lib/course-extraction'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST /api/ai/extract-content — (ré)extraction admin.
 * Corps : { courseId, imageUrl?, contentType? } — re-télécharge le fichier
 * depuis le bucket course-images si imageUrl fournie.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const { courseId, imageUrl, contentType } = await request.json()
    if (!courseId) {
      return NextResponse.json({ error: 'courseId requis' }, { status: 400 })
    }

    let url = imageUrl
    if (!url) {
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('image_url, content_type')
        .eq('id', courseId)
        .single()
      url = course?.image_url
      if (!url) {
        return NextResponse.json({ error: 'Aucun fichier associé à ce cours' }, { status: 400 })
      }
    }

    // Chemin dans le bucket = partie après /object/public/course-images/
    const match = url.match(/\/object\/public\/course-images\/(.+)$/)
    const storagePath = match?.[1] ?? url.split('/').slice(-2).join('/')

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('course-images')
      .download(storagePath)

    if (downloadError || !fileData) {
      console.error('[extract-content] download failed:', downloadError)
      return NextResponse.json({ error: 'Fichier introuvable dans le stockage' }, { status: 404 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const fileName = storagePath.split('/').pop() ?? 'fichier.pdf'

    await extractCourseContent(courseId, buffer, fileName, contentType ?? '')

    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('extraction_status')
      .eq('id', courseId)
      .single()

    return NextResponse.json({
      success: course?.extraction_status === 'completed',
      extraction_status: course?.extraction_status,
    })
  } catch (error: any) {
    console.error('❌ AI extraction error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
