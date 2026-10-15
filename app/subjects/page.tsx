'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  Play,
  Award,
} from 'lucide-react'
import NewHeader from '../../components/NewHeader'
import NewFooter from '../../components/NewFooter'

interface Chapter {
  id: string
  title: string
  description: string | null
  type_chapitre: string | null
  duree_heures: number | null
  objectifs: string | null
  courses: { id: string; title: string }[]
  children: Chapter[]
}

interface Subject {
  id: string
  name: string
  code: string | null
  description: string | null
  objectifs: string | null
  evaluation: string | null
  semestre: string | null
  duree_heures: number | null
  coefficient: number | null
  enseignant: string | null
  chapters: Chapter[]
}

interface FormationGroup {
  code: string
  label: string
  subjects: Subject[]
}

const typeLabels: Record<string, string> = {
  cours: 'Cours',
  evaluation: 'Évaluation',
  td: 'TD',
  tp: 'TP',
  synthese: 'Synthèse',
}

export default function SubjectsPage() {
  const [tree, setTree] = useState<FormationGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/subjects')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Erreur de chargement'))))
      .then(setTree)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <NewHeader />

      <div className="relative overflow-hidden pt-24 pb-12 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">Catalogue des </span>
              <span className="gradient-text">matières</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Programme officiel par formation — chaque matière détaille ses chapitres et les cours disponibles.
            </p>
          </motion.div>

          {loading && (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
              <p className="text-gray-500">Chargement du catalogue…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center py-20">
              <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && tree.length === 0 && (
            <div className="text-center py-20">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Le catalogue est en cours de préparation.</p>
            </div>
          )}

          <div className="space-y-10">
            {tree.map((group) => (
              <section key={group.code}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center mb-4"
                >
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-3 py-1.5 rounded-xl mr-3">
                    {group.code}
                  </span>
                  {group.label !== group.code && (
                    <h2 className="text-lg font-semibold text-gray-900">{group.label}</h2>
                  )}
                </motion.div>

                <div className="grid gap-4">
                  {group.subjects.map((subject, i) => {
                    const expanded = expandedSubjects.has(subject.id)
                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <button
                          onClick={() => toggle(expandedSubjects, setExpandedSubjects, subject.id)}
                          className="w-full flex items-center p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                              {subject.code && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{subject.code}</span>
                              )}
                              {subject.semestre && (
                                <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded">{subject.semestre.toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1.5">
                              {subject.duree_heures != null && (
                                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{subject.duree_heures}h de cours</span>
                              )}
                              {subject.coefficient != null && (
                                <span className="flex items-center"><Award className="w-3.5 h-3.5 mr-1" />coefficient {subject.coefficient}</span>
                              )}
                              {subject.enseignant && <span>{subject.enseignant}</span>}
                              <span>{subject.chapters.length} chapitre{subject.chapters.length > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          {expanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>

                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="border-t border-gray-100 overflow-hidden"
                            >
                              <div className="p-5 pt-4 space-y-3">
                                {subject.description && (
                                  <p className="text-sm text-gray-600 whitespace-pre-line">{subject.description}</p>
                                )}
                                {subject.evaluation && (
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium text-gray-700">Évaluation : </span>
                                    {subject.evaluation}
                                  </p>
                                )}

                                <div className="space-y-1.5">
                                  {subject.chapters.map((chapter) => (
                                    <div key={chapter.id} className="rounded-xl border border-gray-100 bg-gray-50/50">
                                      <button
                                        onClick={() => toggle(expandedChapters, setExpandedChapters, chapter.id)}
                                        className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100/60 rounded-xl transition-colors"
                                      >
                                        {expandedChapters.has(chapter.id) ? (
                                          <ChevronDown className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                        )}
                                        <span className="text-sm font-medium text-gray-800 flex-1">{chapter.title}</span>
                                        {chapter.type_chapitre && (
                                          <span className="text-xs bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded mr-2">
                                            {typeLabels[chapter.type_chapitre] ?? chapter.type_chapitre}
                                          </span>
                                        )}
                                        {chapter.duree_heures != null && (
                                          <span className="text-xs text-gray-400">{chapter.duree_heures}h</span>
                                        )}
                                      </button>

                                      {expandedChapters.has(chapter.id) && (
                                        <div className="px-4 pb-3 space-y-2">
                                          {chapter.objectifs && (
                                            <p className="text-xs text-gray-500 whitespace-pre-line">{chapter.objectifs}</p>
                                          )}
                                          {chapter.description && (
                                            <p className="text-xs text-gray-500 whitespace-pre-line">{chapter.description}</p>
                                          )}
                                          {chapter.courses.length > 0 ? (
                                            <div className="space-y-1">
                                              {chapter.courses.map((c) => (
                                                <a
                                                  key={c.id}
                                                  href={`/quiz?courseId=${c.id}`}
                                                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors group"
                                                >
                                                  <Play className="w-3.5 h-3.5 mr-2 group-hover:translate-x-0.5 transition-transform" />
                                                  {c.title}
                                                </a>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-gray-400 italic">Cours en préparation.</p>
                                          )}
                                          {chapter.children.map((child) => (
                                            <p key={child.id} className="text-xs text-gray-500 ml-4">↳ {child.title}</p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
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
        </div>
      </div>

      <NewFooter />
    </div>
  )
}
