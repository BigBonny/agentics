/**
 * Extraction de contenu pédagogique depuis un fichier cours (PDF / TXT).
 *
 * Pipeline : buffer du fichier → texte brut (pdf-parse v1) → structuration LLM
 * par blocs (Groq, voir lib/groq.ts) → métadonnées du cours + lignes
 * `course_content` (sections). Le document entier est couvert : les blocs que
 * le LLM ne peut pas traiter (pas de clé, quota, délai) sont découpés en
 * sections brutes « Partie N » pour que le cours reste exploitable.
 */

import { groqChat, GROQ_MODEL_FALLBACKS } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase'

// Un bloc LLM ≈ 10k caractères (~3k tokens) + 3500 tokens de sortie : tient dans
// les 8k TPM du tier gratuit Groq. Le quota est PAR MODÈLE, donc chaque bloc
// démarre sur un modèle différent de la chaîne de repli et ils partent en parallèle.
const LLM_CHUNK_CHARS = 10_000
const LLM_MAX_TOKENS = 3500
// Au-delà, le reste du document passe en sections brutes (quota + maxDuration 60 s
// des routes d'upload). À augmenter via l'env sur un tier Groq payant.
const MAX_LLM_CHUNKS = Math.max(1, Number(process.env.EXTRACTION_MAX_LLM_CHUNKS) || 4)
const LLM_TIME_BUDGET_MS = 40_000
const CHUNK_TARGET_CHARS = 2_000

export interface StructuredChapter {
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

export interface StructuredDocument {
  /** Métadonnées du cours (issues du premier bloc) — null si le LLM n'a pas répondu. */
  meta: Omit<StructuredCourse, 'chapters'> | null
  chapters: StructuredChapter[]
  /** Nombre de blocs structurés par le LLM / nombre total de blocs du document. */
  llmChunks: number
  totalChunks: number
}

type ChatFn = typeof groqChat

/** Texte brut depuis un buffer PDF/TXT. */
export async function extractText(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  if (contentType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
    return buffer.toString('utf-8')
  }
  if (contentType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    // pdf-parse v1 (CJS, pdf.js embarqué) — v2 casse le build webpack (imports
    // d'exports absents de pdfjs-dist 5.x). On importe le fichier lib pour
    // éviter le mode debug de index.js.
    const mod = await import('pdf-parse/lib/pdf-parse.js')
    const pdfParse = (mod as any).default ?? mod
    const result = await pdfParse(buffer)
    return result.text ?? ''
  }
  throw new Error(`Type de fichier non supporté : ${contentType} (${fileName})`)
}

/**
 * Découpe un texte en blocs d'environ `target` caractères, en coupant de
 * préférence sur un saut de paragraphe, sinon sur une fin de phrase, dans la
 * fenêtre [60 %..110 %] de la cible. Aucun caractère utile n'est perdu.
 */
export function splitText(text: string, target: number): string[] {
  const chunks: string[] = []
  let rest = text.trim()
  const min = target * 0.6
  while (rest.length > target * 1.1) {
    const window = rest.slice(0, Math.floor(target * 1.1))
    let cut = window.lastIndexOf('\n\n')
    if (cut < min) {
      const sentenceEnd = Math.max(
        window.lastIndexOf('.\n'),
        window.lastIndexOf('. '),
        window.lastIndexOf('? '),
        window.lastIndexOf('! ')
      )
      cut = sentenceEnd < min ? target : sentenceEnd + 1
    }
    chunks.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trim()
  }
  if (rest) chunks.push(rest)
  return chunks
}

/** Sections de secours (sans LLM) : découpage propre du texte, titres attribués à l'assemblage. */
function fallbackChapters(text: string): StructuredChapter[] {
  return splitText(text, CHUNK_TARGET_CHARS).map((content) => ({
    title: '',
    type: 'lesson' as const,
    duration_minutes: Math.max(2, Math.round(content.length / 900)),
    content,
  }))
}

const CHAPTER_SCHEMA = `{
      "title": "titre de la section",
      "type": "lesson",
      "duration_minutes": 15,
      "content": "contenu pédagogique fidèle au document, bien structuré en texte (pas de markdown HTML)"
    }`

const CHAPTER_RULES = `- Sections dans l'ordre du document ; type parmi lesson|exercise|reading (video uniquement si le document décrit une vidéo).
- Le contenu de chaque section reprend les notions réelles du document — ne résume pas à une phrase.
- Réponds en français sauf si le document est entièrement dans une autre langue.`

function buildPrompt(chunk: string, index: number, total: number, hints: { title?: string }): string {
  const fileLine = hints.title ? `Nom du fichier : ${hints.title}\n` : ''

  if (index === 0) {
    const partNote =
      total > 1
        ? `Ce texte est le DÉBUT d'un document plus long (partie 1/${total}) : les métadonnées décrivent le cours entier tel qu'on peut le déduire, les sections ne couvrent que ce texte.\n`
        : ''
    return `Tu transformes le contenu brut d'un document de cours en structure pédagogique JSON.

${fileLine}${partNote}
CONTENU :
"""
${chunk}
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
    ${CHAPTER_SCHEMA}
  ]
}

Règles :
${CHAPTER_RULES}
- level/difficulty entre 1 et 10. duration_hours réaliste pour le cours entier (peut être décimal).`
  }

  return `Tu transformes un extrait d'un document de cours en sections pédagogiques JSON.

${fileLine}Ce texte est la partie ${index + 1}/${total} du document (la suite, pas le début).

CONTENU :
"""
${chunk}
"""

Réponds UNIQUEMENT avec un JSON valide de cette forme :
{
  "chapters": [
    ${CHAPTER_SCHEMA}
  ]
}

Règles :
${CHAPTER_RULES}
- N'invente ni introduction ni conclusion : uniquement ce que contient cet extrait.
- Si l'extrait commence au milieu d'une section, intitule-la d'après son contenu.`
}

/** Structure un bloc avec le LLM. Renvoie null sur toute erreur (quota, JSON invalide, délai). */
async function structureChunk(
  chat: ChatFn,
  chunk: string,
  index: number,
  total: number,
  hints: { title?: string },
  deadline: number
): Promise<StructuredCourse | null> {
  const remaining = deadline - Date.now()
  if (remaining <= 0) return null

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const completion = await Promise.race([
      chat({
        messages: [{ role: 'user', content: buildPrompt(chunk, index, total, hints) }],
        temperature: 0.2,
        max_tokens: LLM_MAX_TOKENS,
        response_format: { type: 'json_object' },
        // Chaque bloc démarre sur un modèle différent (quota TPM par modèle) ;
        // le premier bloc — métadonnées — garde le meilleur modèle.
        model: GROQ_MODEL_FALLBACKS[index % GROQ_MODEL_FALLBACKS.length],
      }),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), remaining)
      }),
    ])
    if (!completion) {
      console.warn(`[extract] bloc ${index + 1}/${total} : délai LLM dépassé, sections brutes`)
      return null
    }

    const raw = completion.choices[0]?.message?.content
    if (!raw) return null
    const parsed = JSON.parse(raw) as StructuredCourse
    if (!Array.isArray(parsed.chapters)) return null
    parsed.chapters = parsed.chapters.filter((ch) => ch && String(ch.content || '').trim())
    return parsed.chapters.length ? parsed : null
  } catch (error: any) {
    console.warn(`[extract] bloc ${index + 1}/${total} : LLM en échec (${error?.message ?? error}), sections brutes`)
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Structure le document ENTIER : le texte est découpé en blocs, chacun structuré
 * par le LLM en parallèle ; les blocs non traités retombent en sections brutes,
 * à leur place dans l'ordre du document.
 * `chat` est injectable pour les tests ; null = pas de LLM.
 */
export async function structureDocument(
  text: string,
  hints: { title?: string },
  chat: ChatFn | null = process.env.GROQ_API_KEY ? groqChat : null
): Promise<StructuredDocument> {
  const chunks = splitText(text, LLM_CHUNK_CHARS)
  const deadline = Date.now() + LLM_TIME_BUDGET_MS

  const results = await Promise.all(
    chunks.map((chunk, i) =>
      chat && i < MAX_LLM_CHUNKS ? structureChunk(chat, chunk, i, chunks.length, hints, deadline) : null
    )
  )

  const chapters: StructuredChapter[] = []
  results.forEach((result, i) => {
    chapters.push(...(result ? result.chapters : fallbackChapters(chunks[i])))
  })
  chapters.forEach((ch, i) => {
    if (!String(ch.title || '').trim()) ch.title = `Partie ${i + 1}`
  })

  let meta: StructuredDocument['meta'] = null
  if (results[0]) {
    const { chapters: _ignored, ...rest } = results[0]
    meta = rest
  }

  return {
    meta,
    chapters,
    llmChunks: results.filter(Boolean).length,
    totalChunks: chunks.length,
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
): Promise<{ status: 'completed' | 'failed'; error?: string }> {
  try {
    await supabaseAdmin.from('courses').update({ extraction_status: 'processing' }).eq('id', courseId)

    const text = (await extractText(buffer, fileName, contentType)).trim()
    if (text.length < 50) {
      await supabaseAdmin
        .from('courses')
        .update({ extraction_status: 'failed' })
        .eq('id', courseId)
      const msg = `Texte insuffisant extrait (${text.length} caractères) — PDF scanné/image ou illisible`
      console.error(`[extract] cours ${courseId} :`, msg)
      return { status: 'failed', error: msg }
    }

    const doc = await structureDocument(text, { title: fileName })
    const structured = doc.meta
    const chapters = doc.chapters

    // Métadonnées du cours : on n'écrase pas les valeurs déjà renseignées par l'admin
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('title, description, subject, topics, learning_objectives, level, difficulty, duration_hours')
      .eq('id', courseId)
      .single()

    const update: Record<string, unknown> = {
      ai_extracted_content: text,
      extraction_status: 'completed',
      // 0.9 = tout le document structuré par le LLM, 0.7 = en partie, 0.5 = sections brutes
      extraction_confidence:
        doc.llmChunks === 0 ? 0.5 : doc.llmChunks === doc.totalChunks ? 0.9 : 0.7,
      updated_at: new Date().toISOString(),
    }
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    const placeholderTitle =
      !course?.title ||
      course.title === 'Test Course' ||
      course.title === fileName ||
      course.title === cleanFileName
    if (structured) {
      if (placeholderTitle && structured.title) update.title = structured.title
      if ((!course?.description || course.description.startsWith('Cours basé sur')) && structured.description)
        update.description = structured.description
      if ((!course?.subject || ['general', 'général'].includes(course.subject.toLowerCase())) && structured.subject)
        update.subject = structured.subject
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

    console.log(
      `[extract] cours ${courseId} : ${chapters.length} sections, ${text.length} caractères, ` +
        `${doc.llmChunks}/${doc.totalChunks} blocs structurés par le LLM`
    )
    return { status: 'completed' }
  } catch (error: any) {
    console.error('[extract] échec pour le cours', courseId, error)
    await supabaseAdmin.from('courses').update({ extraction_status: 'failed' }).eq('id', courseId)
    return { status: 'failed', error: error?.message ?? String(error) }
  }
}
