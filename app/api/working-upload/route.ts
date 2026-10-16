import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { extractCourseContent } from '@/lib/course-extraction'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || 'Test Course'
    const description = formData.get('description') as string || ''
    const subject = formData.get('subject') as string || 'general'
    const level = parseInt(formData.get('level') as string) || 5
    const difficulty = parseInt(formData.get('difficulty') as string) || 5
    const duration_hours = parseInt(formData.get('duration_hours') as string) || 10
    const topics = JSON.parse(formData.get('topics') as string || '[]')
    const learning_objectives = JSON.parse(formData.get('learning_objectives') as string || '[]')
    const prerequisites = JSON.parse(formData.get('prerequisites') as string || '[]')
    const chapterId = formData.get('chapterId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large',
        details: { fileSizeMB: (file.size / 1024 / 1024).toFixed(2), maxSizeMB: 50 },
      }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop() || 'bin'
    const isText = file.type === 'text/plain' || fileExt === 'txt'
    const isPdf = file.type === 'application/pdf' || fileExt === 'pdf'

    if (!isText && !isPdf) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté — envoyez un PDF ou un TXT.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Stocke le fichier (utile pour ré-extraction ultérieure / audit)
    const filePath = `course-files/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('course-images')
      .upload(filePath, buffer, { cacheControl: '3600', upsert: true, contentType: file.type })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError)
      return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from('course-images').getPublicUrl(filePath)

    // created_by référence users.id (UUID Supabase), pas l'ID Clerk
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!dbUser) {
      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          subscription_tier: 'free',
          subscription_status: 'active',
        })
        .select('id')
        .single()
      dbUser = newUser
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 500 })
    }

    // Crée le cours
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert({
        title,
        description,
        image_url: urlData.publicUrl,
        content_type: isPdf ? 'pdf' : 'txt',
        extraction_status: 'processing',
        is_published: false,
        created_by: dbUser.id,
        subject,
        level,
        difficulty,
        duration_hours,
        topics,
        learning_objectives,
        prerequisites,
        ...(chapterId ? { chapter_id: chapterId } : {}),
      })
      .select()
      .single()

    if (courseError) {
      console.error('❌ Course creation failed:', courseError)
      await supabaseAdmin.storage.from('course-images').remove([filePath])
      return NextResponse.json({ error: 'Course creation failed', details: courseError.message }, { status: 500 })
    }

    // Extraction synchrone : fiable sur serverless (vs setTimeout + self-fetch gelé après la réponse)
    const result = await extractCourseContent(course.id, buffer, file.name, file.type)

    return NextResponse.json({
      success: result.status === 'completed',
      course: { ...course, extraction_status: result.status },
      extraction_status: result.status,
      extraction_error: result.error,
      message:
        result.status === 'completed'
          ? 'Cours créé et contenu extrait'
          : `Cours créé — extraction en échec : ${result.error}`,
    })
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 })
  }
}
