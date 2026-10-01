'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Plus,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
} from 'lucide-react'
import Header from '../../../../components/Header'

interface Chapter {
  id: string
  title: string
  content: string
  type: 'lesson' | 'exercise' | 'video' | 'reading'
  order_index: number
  duration_minutes?: number
}

interface Course {
  id: string
  title: string
  description: string
  subject: string
  level: number
  difficulty: number
  duration_hours: number
  is_published: boolean
  chapters: Chapter[]
}

const CHAPTER_TYPES = [
  { value: 'lesson', label: 'Leçon' },
  { value: 'exercise', label: 'Exercice' },
  { value: 'video', label: 'Vidéo' },
  { value: 'reading', label: 'Lecture' },
]

export default function CourseEditor({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [newChapter, setNewChapter] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', subject: '', level: 1, difficulty: 5, duration_hours: 0, is_published: false })

  useEffect(() => {
    fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/courses/${id}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur de chargement')
      const data = await res.json()
      setCourse(data)
      setForm({
        title: data.title,
        description: data.description || '',
        subject: data.subject || '',
        level: data.level ?? 1,
        difficulty: data.difficulty ?? 5,
        duration_hours: data.duration_hours ?? 0,
        is_published: !!data.is_published,
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const saveCourse = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          level: Number(form.level),
          difficulty: Number(form.difficulty),
          duration_hours: Number(form.duration_hours),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur de sauvegarde')
      await fetchCourse()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveChapter = async (chapter: Partial<Chapter>, contentId?: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}/content`, {
        method: contentId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentId ? { contentId, ...chapter } : chapter),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur de sauvegarde')
      setEditingChapter(null)
      setNewChapter(false)
      await fetchCourse()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteChapter = async (contentId: string) => {
    if (!confirm('Supprimer ce chapitre ?')) return
    const res = await fetch(`/api/admin/courses/${id}/content?contentId=${contentId}`, { method: 'DELETE' })
    if (res.ok) await fetchCourse()
    else alert((await res.json()).error || 'Erreur de suppression')
  }

  const moveChapter = async (chapter: Chapter, direction: -1 | 1) => {
    const chapters = [...(course?.chapters ?? [])]
    const idx = chapters.findIndex((c) => c.id === chapter.id)
    const swap = chapters[idx + direction]
    if (idx < 0 || !swap) return
    setSaving(true)
    await fetch(`/api/admin/courses/${id}/content`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: chapter.id, order_index: swap.order_index }),
    })
    await fetch(`/api/admin/courses/${id}/content`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: swap.id, order_index: chapter.order_index }),
    })
    await fetchCourse()
    setSaving(false)
  }

  const typeLabel = (t: string) => CHAPTER_TYPES.find((c) => c.value === t)?.label ?? t

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/admin/courses')}
          className="flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux cours
        </button>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : course && (
          <>
            {/* Infos du cours */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" /> Informations du cours
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <textarea className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <input className="border rounded-lg px-3 py-2" placeholder="Matière" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs text-gray-500">Niveau<input type="number" min={0} max={10} className="border rounded-lg px-3 py-2 w-full" value={form.level} onChange={(e) => setForm({ ...form, level: +e.target.value })} /></label>
                  <label className="text-xs text-gray-500">Difficulté<input type="number" min={1} max={10} className="border rounded-lg px-3 py-2 w-full" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: +e.target.value })} /></label>
                  <label className="text-xs text-gray-500">Heures<input type="number" min={0} className="border rounded-lg px-3 py-2 w-full" value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: +e.target.value })} /></label>
                </div>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="w-4 h-4" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                  <span>Publié</span>
                </label>
              </div>
              <button onClick={saveCourse} disabled={saving} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Enregistrement…' : 'Enregistrer le cours'}
              </button>
            </motion.div>

            {/* Chapitres */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Chapitres ({course.chapters.length})</h2>
                <button onClick={() => setNewChapter(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter un chapitre
                </button>
              </div>

              {newChapter && (
                <ChapterForm
                  onSave={(c) => saveChapter(c)}
                  onCancel={() => setNewChapter(false)}
                />
              )}

              <div className="space-y-2">
                {course.chapters.map((chapter, idx) => (
                  <div key={chapter.id} className="border rounded-lg">
                    {editingChapter?.id === chapter.id ? (
                      <ChapterForm
                        chapter={editingChapter}
                        onSave={(c) => saveChapter(c, chapter.id)}
                        onCancel={() => setEditingChapter(null)}
                      />
                    ) : (
                      <div className="flex items-center p-3">
                        <span className="w-8 text-sm font-mono text-gray-400">{idx + 1}</span>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{chapter.title}</span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{typeLabel(chapter.type)}</span>
                            {chapter.duration_minutes ? <span>{chapter.duration_minutes} min</span> : null}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => moveChapter(chapter, -1)} disabled={idx === 0 || saving} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                          <button onClick={() => moveChapter(chapter, 1)} disabled={idx === course.chapters.length - 1 || saving} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                          <button onClick={() => setEditingChapter(chapter)} className="p-1.5 text-gray-600 hover:text-gray-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteChapter(chapter.id)} className="p-1.5 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {course.chapters.length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm">Aucun chapitre — ajoutez-en un ou uploadez un PDF pour extraction automatique.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function ChapterForm({
  chapter,
  onSave,
  onCancel,
}: {
  chapter?: Chapter
  onSave: (c: Partial<Chapter>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: chapter?.title ?? '',
    content: chapter?.content ?? '',
    type: chapter?.type ?? 'lesson' as Chapter['type'],
    duration_minutes: chapter?.duration_minutes ?? 0,
  })

  return (
    <div className="p-4 space-y-3 bg-indigo-50/50">
      <div className="flex space-x-3">
        <input className="border rounded-lg px-3 py-2 flex-1 bg-white" placeholder="Titre du chapitre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="border rounded-lg px-3 py-2 bg-white" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Chapter['type'] })}>
          {CHAPTER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" min={0} className="border rounded-lg px-3 py-2 w-24 bg-white" placeholder="min" title="Durée (minutes)" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} />
      </div>
      <textarea className="border rounded-lg px-3 py-2 w-full bg-white" placeholder="Contenu du chapitre" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      <div className="flex space-x-2">
        <button onClick={() => onSave(form)} disabled={!form.title.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-50">
          <Save className="w-4 h-4 mr-2" /> Enregistrer
        </button>
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm flex items-center">
          <X className="w-4 h-4 mr-1" /> Annuler
        </button>
      </div>
    </div>
  )
}
