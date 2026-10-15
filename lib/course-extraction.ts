/**
 * Extraction de contenu pédagogique depuis un fichier cours (PDF / TXT).
 *
 * Pipeline : buffer du fichier → texte brut (pdf-parse v2) → structuration LLM
 * (Groq llama-3.3-70b) → métadonnées du cours + lignes `course_content`
 * (chapitres). Sans clé Groq, découpe le texte en chapitres bruts pour que
 * le cours reste exploitable.
 */

import Groq from 'groq-sdk'
import { supabaseAdmin } from '@/lib/supabase'

const MAX_TEXT_CHARS = 25_000
const CHUNK_TARGET_CHARS = 2_000

interface StructuredChapter {
  title: string
  type: 'lesson' | 'exercise' | 'video' | 'reading'
  duration_minutes?: number
  content: string
}

interface StructuredCourse {
  title?: string
  description?: string
  subject?: string
  level?: number
  difficulty?: number
  duration_hours?: number
  topics?: string[]
  learning_objectives?: string[]
  prerequisites?: string[]
  chapters: StructuredChapter[]
}

/** Texte brut depuis un buffer PDF/TXT. */
export async function extractText(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  if (contentType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
    return buffer.toString('utf-8')
  }
  if (contentType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy().catch(() => undefined)
    return result.text ?? ''
  }
  throw new Error(`Type de fichier non supporté : ${contentType} (${fileName})`)
}

/** Chapitres de secours quand aucun LLM n'est configuré : découpage propre du texte. */
function fallbackChapters(text: string): StructuredChapter[] {
  const clean = text.trim()
  if (!clean) return []
  const chunks: string[] = []
  let rest = clean
  while (rest.length > CHUNK_TARGET_CHARS) {
    // coupe à la fin de phrase la plus proche dans la fenêtre [60%..110%] de la cible
    const window = rest.slice(0, Math.floor(CHUNK_TARGET_CHARS * 1.1))
    let cut = Math.max(
      window.lastIndexOf('.\n'),
      window.lastIndexOf('. '),
      window.lastIndexOf('? '),
      window.lastIndexOf('! ')
    )
    if (cut < CHUNK_TARGET_CHARS * 0.6) cut = CHUNK_TARGET_CHARS
    else cut += 1
    chunks.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trim()
  }
  if (rest) chunks.push(rest)

  return chunks.map((content, i) => ({
    title: `Partie ${i + 1}`,
    type: 'lesson' as const,
    duration_minutes: Math.max(2, Math.round(content.length / 900)),
    content,
  }))
}

/** Structure le texte avec Groq (llama-3.3-70b) — titre, métadonnées, chapitres. */
async function structureWithLLM(text: string, hints: { title?: string }): Promise<StructuredCourse | null> {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey || !process.env.GROQ_API_KEY) return null

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const prompt = `Tu transformes le contenu brut d'un document de cours en structure pédagogique JSON.

${hints.title ? `Nom du fichier : ${hints.title}\n` : ''}
CONTENU :
"""
${text.slice(0, MAX_TEXT_CHARS)}
"""

Réponds UNIQUEMENT avec un JSON valide de cette forme :
{
  "title": "titre du cours (déduit du contenu si le nom de fichier est générique)",
  "description": "résumé du cours en 2-3 phrases",
  "subject": "matière principale (un seul mot ou expression courte)",
  "level": 5,
  "difficulty": 5,
  "duration_hours": 2,
  "topics": ["sujet1", "sujet2"],
  "learning_objectives": ["objectif1", "objectif2"],
  "prerequisites": ["prérequis1"],
  "chapters": [
    {
      "title": "titre du chapitre",
      "type": "lesson",
      "duration_minutes": 15,
      "content": "contenu pédagogique fidèle au document, bien structuré en texte (pas de markdown HTML)"
    }
  ]
}

Règles :
- Chapitres dans l'ordre du document ; type parmi lesson|exercise|reading (video uniquement si le document décrit une vidéo).
- Le contenu de chaque chapitre reprend les notions réelles du document — ne résume pas à une phrase.
- level/difficulty entre 1 et 10. duration_hours réaliste (peut être décimal).
- Réponds en français sauf si le document est entièrement dans une autre langue.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StructuredCourse
    if (!Array.isArray(parsed.chapters)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Point d'entrée appelé par les routes d'upload : met à jour le cours et crée
 * les chapitres dans course_content. Ne lève jamais — l'état d'extraction du
 * cours reflète le résultat.
 */
export async function extractCourseContent(
  courseId: string,
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<void> {
  try {
    await supabaseAdmin.from('courses').update({ extraction_status: 'processing' }).eq('id', courseId)

    const text = (await extractText(buffer, fileName, contentType)).trim()
    if (text.length < 50) {
      await supabaseAdmin
        .from('courses')
        .update({ extraction_status: 'failed' })
        .eq('id', courseId)
      console.error(`[extract] cours ${courseId} : texte insuffisant (${text.length} caractères)`)
      return
    }

    const structured = await structureWithLLM(text, { title: fileName })
    const chapters = structured?.chapters?.length
      ? structured.chapters
      : fallbackChapters(text)

    // Métadonnées du cours : on n'écrase pas les valeurs déjà renseignées par l'admin
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('title, description, subject, topics, learning_objectives, level, difficulty, duration_hours')
      .eq('id', courseId)
      .single()

    const update: Record<string, unknown> = {
      ai_extracted_content: text,
      extraction_status: 'completed',
      extraction_confidence: structured ? 0.9 : 0.5,
      updated_at: new Date().toISOString(),
    }
    if (structured) {
      if (!course?.title || course.title === 'Test Course' || course.title === fileName) update.title = structured.title
      if (!course?.description) update.description = structured.description
      if (!course?.subject || course.subject === 'general') update.subject = structured.subject
      if (!course?.topics?.length && structured.topics?.length) update.topics = structured.topics
      if (!course?.learning_objectives?.length && structured.learning_objectives?.length)
        update.learning_objectives = structured.learning_objectives
      if (structured.prerequisites?.length) update.prerequisites = structured.prerequisites
      if (structured.difficulty) update.difficulty = structured.difficulty
      if (structured.duration_hours) update.duration_hours = structured.duration_hours
    }
    await supabaseAdmin.from('courses').update(update).eq('id', courseId)

    // Chapitres → course_content (remplace les anciens si re-extraction)
    if (chapters.length) {
      await supabaseAdmin.from('course_content').delete().eq('course_id', courseId)
      const rows = chapters.map((ch, i) => ({
        course_id: courseId,
        title: String(ch.title || `Chapitre ${i + 1}`).slice(0, 300),
        content: String(ch.content || ''),
        type: ['lesson', 'exercise', 'video', 'reading'].includes(ch.type) ? ch.type : 'lesson',
        order_index: i + 1,
        duration_minutes: ch.duration_minutes ?? null,
      }))
      const { error } = await supabaseAdmin.from('course_content').insert(rows)
      if (error) console.error('[extract] insert course_content:', error.message)
    }

    console.log(`[extract] cours ${courseId} : ${chapters.length} chapitres, ${text.length} caractères`)
  } catch (error) {
    console.error('[extract] échec pour le cours', courseId, error)
    await supabaseAdmin.from('courses').update({ extraction_status: 'failed' }).eq('id', courseId)
  }
}
