'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Upload,
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Clock,
  Target,
  AlertCircle,
  CheckSquare,
  Square,
  GraduationCap,
} from 'lucide-react'
import Header from '../../../components/NewHeader'
import BatchUpload from '../../../components/BatchUpload'

interface Course {
  id: string
  title: string
  description: string
  subject: string
  level: number
  difficulty: number
  duration_hours: number
  topics: string[]
  learning_objectives: string[]
  prerequisites: string[]
  image_url?: string
  content_type: string
  extraction_status: string
  created_at: string
  updated_at: string
}

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  processing: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function CourseManagement() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showBatchUpload, setShowBatchUpload] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data || [])
    } catch (err: any) {
      console.error('Error fetching courses:', err)
      setError('Erreur lors du chargement des cours')
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
  }

  const selectAllCourses = () => {
    setSelectedCourses(filteredCourses.map((c) => c.id))
  }

  const clearSelection = () => setSelectedCourses([])

  const deleteSelectedCourses = async () => {
    if (selectedCourses.length === 0) return
    if (!confirm(`Supprimer ${selectedCourses.length} cours ?`)) return
    try {
      const response = await fetch('/api/courses/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: selectedCourses }),
      })
      if (response.ok) {
        await fetchCourses()
        clearSelection()
      }
    } catch (error) {
      console.error('Error deleting courses:', error)
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Supprimer ce cours ?')) return
    try {
      const response = await fetch('/api/courses/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: [courseId] }),
      })
      if (response.ok) await fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connectez-vous pour gérer les cours
          </h1>
          <p className="text-gray-600">
            Vous devez être connecté pour accéder à la gestion des cours.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
              Gestion des cours
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {courses.length} cours — gérez le contenu, les chapitres et les publications.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/admin/subjects')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Matières</span>
            </button>
            <button
              onClick={() => router.push('/admin/create-course')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau cours</span>
            </button>
            <button
              onClick={() => setShowBatchUpload(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Téléverser des PDF</span>
            </button>
          </div>
        </div>

        {/* Toolbar: search + view toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou matière…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-colors"
            />
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 self-start">
            <button
              onClick={() => setViewMode('grid')}
              title="Vue grille"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Vue liste"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection bar */}
        {selectedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <span className="text-sm font-medium text-indigo-800">
              {selectedCourses.length} cours sélectionné{selectedCourses.length > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={selectAllCourses}
                className="text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors flex items-center"
              >
                <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Tout sélectionner
              </button>
              <button
                onClick={clearSelection}
                className="text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors flex items-center"
              >
                <Square className="w-3.5 h-3.5 mr-1.5" /> Désélectionner
              </button>
              <button
                onClick={deleteSelectedCourses}
                className="text-xs font-medium bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Supprimer
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-52 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded-full mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCourses}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Courses */}
        {!loading && !error && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'space-y-3'
            }
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
                onClick={() => router.push(`/admin/courses/${course.id}`)}
                className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'p-5' : 'p-4 flex items-center gap-4'
                } ${selectedCourses.includes(course.id) ? 'ring-2 ring-indigo-400 border-indigo-300' : ''}`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full capitalize">
                          {course.subject}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          statusStyles[course.extraction_status] ?? statusStyles.pending
                        }`}
                      >
                        {course.extraction_status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{course.duration_hours}h</span>
                        <span className="flex items-center"><Target className="w-3.5 h-3.5 mr-1" />{course.difficulty}/10</span>
                        <span>{course.topics?.length ?? 0} sujets</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/admin/courses/${course.id}`)
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCourse(course.id)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-indigo-600 rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                          {course.title}
                        </h3>
                        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                          {course.subject}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                            statusStyles[course.extraction_status] ?? statusStyles.pending
                          }`}
                        >
                          {course.extraction_status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{course.duration_hours}h</span>
                        <span className="flex items-center"><Target className="w-3.5 h-3.5 mr-1" />{course.difficulty}/10</span>
                        <span>Niveau {course.level}</span>
                        <span>{course.topics?.length ?? 0} sujets</span>
                      </div>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/courses/${course.id}`)
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCourse(course.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun cours trouvé</h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery
                ? 'Aucun cours ne correspond à votre recherche.'
                : 'Commencez par créer un cours ou téléverser des PDF.'}
            </p>
            {!searchQuery && (
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => router.push('/admin/create-course')}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" /> Nouveau cours
                </button>
                <button
                  onClick={() => setShowBatchUpload(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" /> Téléverser des PDF
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showBatchUpload && (
        <BatchUpload
          onCancel={() => setShowBatchUpload(false)}
          onUploadComplete={({ hasFailures }) => {
            if (!hasFailures) setShowBatchUpload(false)
            fetchCourses()
          }}
        />
      )}
    </div>
  )
}
