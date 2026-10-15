/**
 * Catalogue pédagogique : matières + chapitres synchronisés depuis QualiSoft
 * (of.formation.module / of.formation.module.chapitre) et extensions locales.
 *
 * Arbre exposé par buildSubjectsTree() :
 *   formation (of.formation, ex. 'BTS CIEL1')
 *     └─ subject / matière (of.formation.module)
 *         └─ chapter (of.formation.module.chapitre ou chapitre local)
 *             └─ courses (cours Agentics rattachés)
 */

import { supabaseAdmin } from '@/lib/supabase'
import { getQualisoftConfig, odooCall } from '@/lib/qualisoft'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubjectChapter {
  id: string
  subject_id: string
  qualisoft_id: number | null
  parent_id: string | null
  title: string
  description: string | null
  type_chapitre: string | null
  sous_type_evaluation: string | null
  objectifs: string | null
  competences_visees: string | null
  duree_heures: number | null
  sequence: number
  niveau: number
  source: 'qualisoft' | 'agentics'
  courses?: LinkedCourse[]
  children?: SubjectChapter[]
}

export interface Subject {
  id: string
  qualisoft_id: number | null
  formation_code: string | null
  formation_label: string | null
  name: string
  code: string | null
  description: string | null
  objectifs: string | null
  evaluation: string | null
  semestre: string | null
  duree_heures: number | null
  coefficient: number | null
  obligatoire: boolean
  enseignant: string | null
  sequence: number
  source: 'qualisoft' | 'agentics'
  is_published: boolean
  synced_at: string | null
  chapters?: SubjectChapter[]
}

export interface LinkedCourse {
  id: string
  title: string
  is_published: boolean
}

export interface FormationGroup {
  code: string
  label: string
  subjects: Subject[]
}

export interface SyncResult {
  modules: number
  chapitres: number
  created: number
  updated: number
  duration_ms: number
}

// ---------------------------------------------------------------------------
// Lecture — arbre complet
// ---------------------------------------------------------------------------

/** Arbre formation → matières → chapitres → cours. `publishedOnly` pour les pages publiques. */
export async function buildSubjectsTree(publishedOnly = false): Promise<FormationGroup[]> {
  let subjectQuery = supabaseAdmin
    .from('subjects')
    .select('*')
    .order('formation_code', { ascending: true })
    .order('sequence', { ascending: true })
  if (publishedOnly) subjectQuery = subjectQuery.eq('is_published', true)

  const [subjectsRes, chaptersRes, coursesRes] = await Promise.all([
    subjectQuery,
    supabaseAdmin.from('subject_chapters').select('*').order('sequence', { ascending: true }),
    supabaseAdmin
      .from('courses')
      .select('id, title, is_published, chapter_id')
      .not('chapter_id', 'is', null),
  ])

  if (subjectsRes.error) throw new Error(subjectsRes.error.message)
  if (chaptersRes.error) throw new Error(chaptersRes.error.message)
  if (coursesRes.error) throw new Error(coursesRes.error.message)

  const coursesByChapter = new Map<string, LinkedCourse[]>()
  for (const c of coursesRes.data ?? []) {
    if (publishedOnly && !c.is_published) continue
    const list = coursesByChapter.get(c.chapter_id) ?? []
    list.push({ id: c.id, title: c.title, is_published: c.is_published })
    coursesByChapter.set(c.chapter_id, list)
  }

  const chaptersBySubject = new Map<string, SubjectChapter[]>()
  for (const ch of chaptersRes.data ?? []) {
    if (publishedOnly && !chaptersBelongsToVisible(ch, subjectsRes.data ?? [])) continue
    const node: SubjectChapter = { ...ch, courses: coursesByChapter.get(ch.id) ?? [], children: [] }
    const list = chaptersBySubject.get(ch.subject_id) ?? []
    list.push(node)
    chaptersBySubject.set(ch.subject_id, list)
  }

  // Chapitres imbriqués (parent_id) : 2 passes suffisent car niveau ≤ 2 en pratique
  chaptersBySubject.forEach((chapters, subjectId) => {
    const byId = new Map<string, SubjectChapter>(chapters.map((c) => [c.id, c]))
    const roots: SubjectChapter[] = []
    for (const c of chapters) {
      const parent = c.parent_id ? byId.get(c.parent_id) : undefined
      if (parent) parent.children!.push(c)
      else roots.push(c)
    }
    chaptersBySubject.set(subjectId, roots)
  })

  const groups = new Map<string, FormationGroup>()
  for (const s of (subjectsRes.data ?? []) as Subject[]) {
    const code = s.formation_code ?? 'AUTRES'
    const group = groups.get(code) ?? ({ code, label: s.formation_label ?? code, subjects: [] as Subject[] })
    group.subjects.push({ ...s, chapters: chaptersBySubject.get(s.id) ?? [] })
    groups.set(code, group)
  }

  return Array.from(groups.values()).sort((a, b) => a.code.localeCompare(b.code))
}

function chaptersBelongsToVisible(chapter: { subject_id: string }, subjects: Array<{ id: string }>) {
  return subjects.some((s) => s.id === chapter.subject_id)
}

// ---------------------------------------------------------------------------
// Synchronisation QualiSoft → Supabase
// ---------------------------------------------------------------------------

/** Convertit le HTML QualiSoft en texte brut (les champs Odoo sont en HTML). */
function htmlToText(html: unknown): string | null {
  if (typeof html !== 'string' || !html.trim() || html === '<p><br></p>') return null
  return html
    .replace(/<\/(p|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim() || null
}

/** Tire les matières et chapitres de QualiSoft et les upserte dans Supabase. */
export async function syncSubjectsFromQualisoft(): Promise<SyncResult> {
  const started = Date.now()
  const cfg = getQualisoftConfig()
  if (cfg.mode !== 'api') {
    throw new Error('Synchronisation impossible : QUALISOFT_MODE doit être "api"')
  }

  const [formations, modules, chapitres] = await Promise.all([
    odooCall<Array<{ id: number; name: string; code: string }>>(
      cfg, 'of.formation', 'search_read',
      { domain: [], fields: ['id', 'name', 'code'], limit: 200 }
    ),
    odooCall<Array<Record<string, unknown>>>(
      cfg, 'of.formation.module', 'search_read',
      {
        domain: [],
        fields: [
          'id', 'name', 'code', 'formation_id', 'sequence', 'duree_heures',
          'coefficient_default', 'contenu', 'objectifs', 'evaluation',
          'semestre', 'obligatoire', 'enseignant_referent_id',
        ],
        limit: 500,
      }
    ),
    odooCall<Array<Record<string, unknown>>>(
      cfg, 'of.formation.module.chapitre', 'search_read',
      {
        domain: [],
        fields: [
          'id', 'name', 'module_id', 'sequence', 'type_chapitre',
          'sous_type_evaluation', 'description', 'duree_heures',
          'objectifs', 'competences_visees', 'parent_id', 'niveau',
        ],
        limit: 1000,
        order: 'sequence asc',
      }
    ),
  ])

  const formationById = new Map(formations.map((f) => [f.id, f]))
  const now = new Date().toISOString()
  let created = 0
  let updated = 0

  // --- Matières ---
  const subjectRows = modules.map((m) => {
    const formation = Array.isArray(m.formation_id) ? formationById.get(m.formation_id[0] as number) : undefined
    return {
      qualisoft_id: m.id as number,
      formation_code: formation?.code ?? null,
      formation_label: formation?.name ?? null,
      name: m.name as string,
      code: (m.code as string) ?? null,
      description: htmlToText(m.contenu),
      objectifs: htmlToText(m.objectifs),
      evaluation: htmlToText(m.evaluation),
      semestre: (m.semestre as string) ?? null,
      duree_heures: (m.duree_heures as number) ?? null,
      coefficient: (m.coefficient_default as number) ?? null,
      obligatoire: m.obligatoire !== false,
      enseignant: Array.isArray(m.enseignant_referent_id) ? (m.enseignant_referent_id[1] as string) : null,
      sequence: (m.sequence as number) ?? 0,
      source: 'qualisoft' as const,
      synced_at: now,
    }
  })

  const { data: existingSubjects } = await supabaseAdmin
    .from('subjects')
    .select('qualisoft_id')
    .eq('source', 'qualisoft')
  const existingSubjectIds = new Set((existingSubjects ?? []).map((s) => s.qualisoft_id))
  created += subjectRows.filter((r) => !existingSubjectIds.has(r.qualisoft_id)).length
  updated += subjectRows.length - created

  const { error: subjErr } = await supabaseAdmin
    .from('subjects')
    .upsert(subjectRows, { onConflict: 'qualisoft_id' })
  if (subjErr) throw new Error(`Upsert matières : ${subjErr.message}`)

  // Récupère les ids Supabase par qualisoft_id pour relier les chapitres
  const { data: synced } = await supabaseAdmin
    .from('subjects')
    .select('id, qualisoft_id')
    .eq('source', 'qualisoft')
  const subjectIdByQualisoft = new Map((synced ?? []).map((s) => [s.qualisoft_id, s.id]))

  // --- Chapitres (passe 1 : sans parent ; passe 2 : parent_id) ---
  const chapterRows = chapitres
    .filter((c) => Array.isArray(c.module_id) && subjectIdByQualisoft.has(c.module_id[0] as number))
    .map((c) => ({
      subject_id: subjectIdByQualisoft.get((c.module_id as number[])[0])!,
      qualisoft_id: c.id as number,
      title: c.name as string,
      description: htmlToText(c.description),
      type_chapitre: (c.type_chapitre as string) ?? null,
      sous_type_evaluation: (c.sous_type_evaluation as string) ?? null,
      objectifs: htmlToText(c.objectifs),
      competences_visees: (c.competences_visees as string) ?? null,
      duree_heures: (c.duree_heures as number) ?? null,
      sequence: (c.sequence as number) ?? 0,
      niveau: (c.niveau as number) ?? 1,
      source: 'qualisoft' as const,
      _qualisoft_parent: Array.isArray(c.parent_id) ? (c.parent_id[0] as number) : null,
    }))

  const { error: chErr } = await supabaseAdmin
    .from('subject_chapters')
    .upsert(
      chapterRows.map(({ _qualisoft_parent, ...row }) => row),
      { onConflict: 'qualisoft_id' }
    )
  if (chErr) throw new Error(`Upsert chapitres : ${chErr.message}`)

  // Passe 2 : rattache les sous-chapitres à leur parent (ids Supabase)
  const { data: syncedChapters } = await supabaseAdmin
    .from('subject_chapters')
    .select('id, qualisoft_id')
    .eq('source', 'qualisoft')
  const chapterIdByQualisoft = new Map((syncedChapters ?? []).map((c) => [c.qualisoft_id, c.id]))

  for (const c of chapterRows) {
    if (!c._qualisoft_parent) continue
    const parentUuid = chapterIdByQualisoft.get(c._qualisoft_parent)
    const childUuid = chapterIdByQualisoft.get(c.qualisoft_id as number)
    if (parentUuid && childUuid) {
      await supabaseAdmin.from('subject_chapters').update({ parent_id: parentUuid }).eq('id', childUuid)
    }
  }

  return {
    modules: subjectRows.length,
    chapitres: chapterRows.length,
    created,
    updated,
    duration_ms: Date.now() - started,
  }
}
