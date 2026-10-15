/**
 * Test de la pipeline d'extraction : PDF réel → texte → structuration → DB.
 * Usage : pnpm tsx scripts/test-extraction.ts
 */
import fs from 'node:fs'
import path from 'node:path'

// Charge .env.local (dotenv absent du projet)
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

async function main() {
  const { extractCourseContent } = await import('../lib/course-extraction')
  const { supabaseAdmin } = await import('../lib/supabase')

  const pdfPath = path.join(__dirname, '..', 'data', 'Document_de_Synthese_J00221587686_v1.pdf')
  const buffer = fs.readFileSync(pdfPath)
  console.log(`PDF: ${pdfPath} (${(buffer.length / 1024).toFixed(0)} Ko)`)

  const { data: anyUser } = await supabaseAdmin.from('users').select('id').limit(1).single()
  if (!anyUser) throw new Error('Aucun utilisateur en base pour created_by')

  // Cours de test
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .insert({
      title: 'TEST EXTRACTION — à supprimer',
      description: '',
      subject: 'general',
      level: 5,
      difficulty: 5,
      duration_hours: 1,
      content_type: 'pdf',
      extraction_status: 'pending',
      is_published: false,
      created_by: anyUser.id,
    })
    .select()
    .single()
  if (error || !course) throw new Error('Insert cours: ' + error?.message)
  console.log('Cours test créé:', course.id)

  await extractCourseContent(course.id, buffer, 'Document_de_Synthese_J00221587686_v1.pdf', 'application/pdf')

  const { data: after } = await supabaseAdmin
    .from('courses')
    .select('extraction_status, title, subject, topics, ai_extracted_content')
    .eq('id', course.id)
    .single()
  const { data: chapters } = await supabaseAdmin
    .from('course_content')
    .select('title, type, order_index')
    .eq('course_id', course.id)
    .order('order_index')

  console.log('---')
  console.log('extraction_status:', after?.extraction_status)
  console.log('title:', after?.title)
  console.log('subject:', after?.subject)
  console.log('topics:', JSON.stringify(after?.topics))
  console.log('ai_extracted_content:', `${after?.ai_extracted_content?.length ?? 0} caractères`)
  console.log('chapitres:', chapters?.length)
  chapters?.slice(0, 10).forEach((c) => console.log(`  ${c.order_index}. [${c.type}] ${c.title}`))

  // Nettoyage
  await supabaseAdmin.from('course_content').delete().eq('course_id', course.id)
  await supabaseAdmin.from('courses').delete().eq('id', course.id)
  console.log('--- Cours test supprimé.')
}

main().catch((e) => {
  console.error('ÉCHEC:', e)
  process.exit(1)
})
