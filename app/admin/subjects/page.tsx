'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  GraduationCap,
  Clock,
  Link2,
  Link2Off,
  Eye,
  EyeOff,
  ArrowLeft,
  Search,
} from 'lucide-react'
import Header from '../../../components/Header'

interface LinkedCourse {
  id: string
  title: string
  is_published: boolean
}

interface Chapter {
  id: string
  subject_id: string
  title: string
  description: string | null
  type_chapitre: string | null
  duree_heures: number | null
  objectifs: string | null
  competences_visees: string | null
  sequence: number
  source: 'qualisoft' | 'agentics'
  courses: LinkedCourse[]
  children: Chapter[]
}

interface Subject {
  id: string
  name: string
  code: string | null
  formation_code: string | null
  formation_label: string | null
  description: string | null
  objectifs: string | null
  evaluation: string | null
  semestre: string | null
  duree_heures: number | null
  coefficient: number | null
  enseignant: string | null
  source: 'qualisoft' | 'agentics'
  is_published: boolean
  synced_at: string | null
  chapters: Chapter[]
}

interface FormationGroup {
  code: string
  label: string
  subjects: Subject[]
}

interface Course {
  id: string
  title: string
  chapter_id: string | null
}

const typeLabels: Record<string, string> = {
  cours: 'Cours',
  evaluation: 'Évaluation',
  td: 'TD',
  tp: 'TP',
  synthese: 'Synthèse',
}

export default function AdminSubjects() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [tree, setTree] = useState<FormationGroup[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [addingChapterTo, setAddingChapterTo] = useState<string | null>(null)
  const [attachChapterId, setAttachChapterId] = useState<string | null>(null)
  const [showNewSubject, setShowNewSubject] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isSignedIn) fetchTree()
  }, [isSignedIn])

  const fetchTree = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/subjects')
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur de chargement')
      const data = await res.json()
      setTree(data.tree)
      setAllCourses(data.courses)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const syncFromQualisoft = async () => {
    setSyncing(true)
    setNotice('')
    setError('')
    try {
      const res = await fetch('/api/admin/subjects/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNotice(`Synchro terminée : ${data.modules} matières, ${data.chapitres} chapitres (${data.created} créés, ${data.updated} mis à jour) en ${(data.duration_ms / 1000).toFixed(1)}s`)
      await fetchTree()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  const togglePublish = async (subject: Subject) => {
    await fetch(`/api/admin/subjects/${subject.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !subject.is_published }),
    })
    fetchTree()
  }

  const saveChapter = async (chapter: Partial<Chapter> & { title: string }, subjectId: string, chapterId?: string) => {
    const res = chapterId
      ? await fetch(`/api/admin/subjects/chapters/${chapterId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chapter),
        })
      : await fetch(`/api/admin/subjects/${subjectId}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chapter),
        })
    if (!res.ok) {
      alert((await res.json()).error || 'Erreur')
      return
    }
    setEditingChapter(null)
    setAddingChapterTo(null)
    fetchTree()
  }

  const deleteChapter = async (chapter: Chapter) => {
    if (!confirm(`Supprimer « ${chapter.title} » ? Les cours rattachés seront détachés.`)) return
    const res = await fetch(`/api/admin/subjects/chapters/${chapter.id}`, { method: 'DELETE' })
    if (res.ok) fetchTree()
    else alert((await res.json()).error)
  }

  const attachCourse = async (chapterId: string, courseId: string) => {
    const res = await fetch(`/api/admin/subjects/chapters/${chapterId}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    if (res.ok) {
      setAttachChapterId(null)
      fetchTree()
    } else alert((await res.json()).error)
  }

  const detachCourse = async (chapterId: string, courseId: string) => {
    await fetch(`/api/admin/subjects/chapters/${chapterId}/courses?courseId=${courseId}`, { method: 'DELETE' })
    fetchTree()
  }

  const deleteSubject = async (subject: Subject) => {
    if (!confirm(`Supprimer la matière « ${subject.name} » et ses chapitres ?`)) return
    const res = await fetch(`/api/admin/subjects/${subject.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) fetchTree()
    else alert(data.error)
  }

  const unlinkedCourses = allCourses.filter((c) => !c.chapter_id)

  const q = searchQuery.trim().toLowerCase()
  const chapterMatches = (ch: Chapter) =>
    ch.title.toLowerCase().includes(q) ||
    ch.courses.some((c) => c.title.toLowerCase().includes(q)) ||
    ch.children?.some((child) => child.title.toLowerCase().includes(q))
  const filteredTree = !q
    ? tree
    : tree
        .map((g) => ({
          ...g,
          subjects: g.subjects.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.code?.toLowerCase().includes(q) ||
              s.description?.toLowerCase().includes(q) ||
              s.enseignant?.toLowerCase().includes(q) ||
              s.chapters.some(chapterMatches)
          ),
        }))
        .filter((g) => g.subjects.length > 0)
  const isSubjectExpanded = (id: string) => (q ? true : expandedSubjects.has(id))
  const isChapterExpanded = (id: string) => (q ? true : expandedChapters.has(id))

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Connectez-vous pour gérer les matières.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        <button
          onClick={() => router.push('/admin/courses')}
          className="flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux cours
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="w-7 h-7 mr-3 text-indigo-600" />
              Matières & chapitres
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Catalogue synchronisé depuis QualiSoft — ajoutez des chapitres et rattachez vos cours.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewSubject(true)}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle matière</span>
            </button>
            <button
              onClick={syncFromQualisoft}
              disabled={syncing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{syncing ? 'Synchro…' : 'Sync QualiSoft'}</span>
            </button>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une matière, un chapitre, un cours…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-colors"
            />
          </div>
        </div>

        {notice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 mb-6 text-sm">{notice}</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}

        {showNewSubject && (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 mb-6">
            <NewSubjectForm
              onSave={async (s) => {
                const res = await fetch('/api/admin/subjects', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(s),
                })
                if (res.ok) {
                  setShowNewSubject(false)
                  fetchTree()
                } else alert((await res.json()).error)
              }}
              onCancel={() => setShowNewSubject(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : tree.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Aucune matière</h3>
            <p className="text-gray-500 text-sm mb-6">
              Cliquez sur « Sync QualiSoft » pour importer le catalogue, ou créez une matière locale.
            </p>
            <button
              onClick={syncFromQualisoft}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" /> Synchroniser depuis QualiSoft
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredTree.map((group) => (
              <section key={group.code}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                  <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg mr-2">{group.code}</span>
                  {group.label !== group.code && <span>{group.label}</span>}
                  <span className="ml-2 text-gray-400 font-normal">({group.subjects.length} matière{group.subjects.length > 1 ? 's' : ''})</span>
                </h2>

                <div className="space-y-3">
                  {group.subjects.map((subject) => {
                    const expanded = isSubjectExpanded(subject.id)
                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                          subject.is_published ? 'border-gray-100' : 'border-gray-200 opacity-75'
                        }`}
                      >
                        {/* Subject row */}
                        <div
                          className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggle(expandedSubjects, setExpandedSubjects, subject.id)}
                        >
                          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400 mr-3" /> : <ChevronRight className="w-4 h-4 text-gray-400 mr-3" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{subject.name}</span>
                              {subject.code && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{subject.code}</span>}
                              {subject.semestre && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{subject.semestre.toUpperCase()}</span>}
                              {subject.source === 'agentics' && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">local</span>}
                              {!subject.is_published && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">masquée</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                              {subject.duree_heures != null && (
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{subject.duree_heures}h</span>
                              )}
                              {subject.coefficient != null && <span>coef. {subject.coefficient}</span>}
                              {subject.enseignant && <span>{subject.enseignant}</span>}
                              <span>{subject.chapters.length} chapitre{subject.chapters.length > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => togglePublish(subject)}
                              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                              title={subject.is_published ? 'Masquer' : 'Publier'}
                            >
                              {subject.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            {subject.source === 'agentics' && (
                              <button
                                onClick={() => deleteSubject(subject)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Chapters */}
                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="border-t border-gray-100 bg-gray-50/50 overflow-hidden"
                            >
                              <div className="p-4 space-y-2">
                                {(subject.objectifs || subject.description) && (
                                  <p className="text-xs text-gray-500 mb-3 whitespace-pre-line">
                                    {subject.objectifs || subject.description}
                                  </p>
                                )}

                                {subject.chapters.map((chapter) => (
                                  <ChapterRow
                                    key={chapter.id}
                                    chapter={chapter}
                                    expanded={isChapterExpanded(chapter.id)}
                                    onToggle={() => toggle(expandedChapters, setExpandedChapters, chapter.id)}
                                    onEdit={() => setEditingChapter(chapter)}
                                    onDelete={() => deleteChapter(chapter)}
                                    onAttach={() => setAttachChapterId(attachChapterId === chapter.id ? null : chapter.id)}
                                    onDetachCourse={(courseId) => detachCourse(chapter.id, courseId)}
                                    attachOpen={attachChapterId === chapter.id}
                                    candidates={unlinkedCourses}
                                    onPickCourse={(courseId) => attachCourse(chapter.id, courseId)}
                                    typeLabels={typeLabels}
                                  />
                                ))}

                                {editingChapter && editingChapter.subject_id === subject.id && (
                                  <ChapterForm
                                    chapter={editingChapter}
                                    onSave={(c) => saveChapter(c, subject.id, editingChapter.id)}
                                    onCancel={() => setEditingChapter(null)}
                                  />
                                )}
                                {addingChapterTo === subject.id && (
                                  <ChapterForm
                                    onSave={(c) => saveChapter(c, subject.id)}
                                    onCancel={() => setAddingChapterTo(null)}
                                  />
                                )}

                                <button
                                  onClick={() => {
                                    setAddingChapterTo(subject.id)
                                    setEditingChapter(null)
                                  }}
                                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center mt-2"
                                >
                                  <Plus className="w-4 h-4 mr-1" /> Ajouter un chapitre
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ChapterRow({
  chapter,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAttach,
  onDetachCourse,
  attachOpen,
  candidates,
  onPickCourse,
  typeLabels,
}: {
  chapter: Chapter
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onAttach: () => void
  onDetachCourse: (courseId: string) => void
  attachOpen: boolean
  candidates: Course[]
  onPickCourse: (courseId: string) => void
  typeLabels: Record<string, string>
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400 mr-2" /> : <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{chapter.title}</span>
            {chapter.type_chapitre && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {typeLabels[chapter.type_chapitre] ?? chapter.type_chapitre}
              </span>
            )}
            {chapter.source === 'agentics' && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">local</span>
            )}
            {chapter.duree_heures != null && (
              <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-0.5" />{chapter.duree_heures}h</span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 mr-2">{chapter.courses.length} cours</span>
        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onAttach} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title="Rattacher un cours">
            <Link2 className="w-4 h-4" />
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100" title="Modifier">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-3 space-y-2">
          {chapter.objectifs && <p className="text-xs text-gray-500 whitespace-pre-line">{chapter.objectifs}</p>}
          {chapter.description && <p className="text-xs text-gray-500 whitespace-pre-line">{chapter.description}</p>}
          {chapter.competences_visees && (
            <p className="text-xs text-gray-400">Compétences : {chapter.competences_visees}</p>
          )}

          {chapter.courses.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {chapter.courses.map((c) => (
                <span key={c.id} className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                  {c.title}
                  <button onClick={() => onDetachCourse(c.id)} className="ml-1.5 opacity-60 hover:opacity-100" title="Détacher">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Aucun cours rattaché.</p>
          )}

          {/* Sous-chapitres */}
          {chapter.children.map((child) => (
            <div key={child.id} className="ml-4 pl-3 border-l-2 border-gray-200 text-sm text-gray-600">
              ↳ {child.title}
            </div>
          ))}
        </div>
      )}

      {attachOpen && <CoursePicker candidates={candidates} onPick={onPickCourse} />}
    </div>
  )
}

function CoursePicker({ candidates, onPick }: { candidates: Course[]; onPick: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const filtered = candidates.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="border-t border-gray-100 p-3" onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        type="text"
        placeholder="Rechercher un cours à rattacher…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
      />
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400">
          {candidates.length === 0
            ? "Tous les cours sont déjà rattachés — ou aucun cours n'existe encore."
            : 'Aucun cours ne correspond.'}
        </p>
      ) : (
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-indigo-50 text-gray-700 flex items-center"
            >
              <BookOpen className="w-3.5 h-3.5 mr-2 text-gray-400" /> {c.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ChapterForm({
  chapter,
  onSave,
  onCancel,
}: {
  chapter?: Chapter
  onSave: (c: any) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: chapter?.title ?? '',
    description: chapter?.description ?? '',
    type_chapitre: chapter?.type_chapitre ?? 'cours',
    duree_heures: chapter?.duree_heures ?? 0,
    objectifs: chapter?.objectifs ?? '',
  })

  return (
    <div className="bg-indigo-50/50 rounded-xl p-4 space-y-3 border border-indigo-100">
      <div className="flex gap-3 flex-wrap">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48 bg-white text-sm"
          placeholder="Titre du chapitre"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm"
          value={form.type_chapitre}
          onChange={(e) => setForm({ ...form, type_chapitre: e.target.value })}
        >
          <option value="cours">Cours</option>
          <option value="td">TD</option>
          <option value="tp">TP</option>
          <option value="evaluation">Évaluation</option>
          <option value="synthese">Synthèse</option>
        </select>
        <input
          type="number"
          min={0}
          step={0.5}
          className="border border-gray-200 rounded-lg px-3 py-2 w-24 bg-white text-sm"
          placeholder="Heures"
          value={form.duree_heures}
          onChange={(e) => setForm({ ...form, duree_heures: +e.target.value })}
        />
      </div>
      <textarea
        className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white text-sm"
        placeholder="Contenu / description"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input
        className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-white text-sm"
        placeholder="Objectifs (optionnel)"
        value={form.objectifs}
        onChange={(e) => setForm({ ...form, objectifs: e.target.value })}
      />
      <div className="flex space-x-2">
        <button
          onClick={() => onSave(form)}
          disabled={!form.title.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" /> Enregistrer
        </button>
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm flex items-center">
          <X className="w-4 h-4 mr-1" /> Annuler
        </button>
      </div>
    </div>
  )
}

function NewSubjectForm({ onSave, onCancel }: { onSave: (s: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', code: '', formation_label: '', duree_heures: 0, semestre: '', description: '' })
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Nouvelle matière (locale)</h3>
      <div className="flex gap-3 flex-wrap">
        <input className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48 text-sm" placeholder="Nom de la matière" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border border-gray-200 rounded-lg px-3 py-2 w-32 text-sm" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input className="border border-gray-200 rounded-lg px-3 py-2 w-40 text-sm" placeholder="Formation (ex. BTS CG)" value={form.formation_label} onChange={(e) => setForm({ ...form, formation_label: e.target.value })} />
        <input type="number" min={0} className="border border-gray-200 rounded-lg px-3 py-2 w-24 text-sm" placeholder="Heures" value={form.duree_heures} onChange={(e) => setForm({ ...form, duree_heures: +e.target.value })} />
      </div>
      <div className="flex space-x-2">
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          Créer
        </button>
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm">Annuler</button>
      </div>
    </div>
  )
}
