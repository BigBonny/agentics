'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import Header from '../../../components/Header'
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

export default function CourseManagement() {
  const { isSignedIn } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showBatchUpload, setShowBatchUpload] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const data = await response.json()
      setCourses(data || [])
    } catch (err: any) {
      console.error('Error fetching courses:', err)
      setError('Erreur lors du chargement des cours')
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const selectAllCourses = () => {
    setSelectedCourses(filteredCourses.map(course => course.id))
  }

  const clearSelection = () => {
    setSelectedCourses([])
  }

  const deleteSelectedCourses = async () => {
    if (selectedCourses.length === 0) return

    try {
      const response = await fetch('/api/courses/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: selectedCourses })
      })

      if (response.ok) {
        await fetchCourses()
        clearSelection()
      }
    } catch (error) {
      console.error('Error deleting courses:', error)
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📚 Gestion des Cours
            </h1>
            <p className="text-gray-600">
              Gérez vos cours, téléversez de nouveaux contenus et organisez votre bibliothèque.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowBatchUpload(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              Téléverser en lot
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection Controls */}
        {selectedCourses.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">
                {selectedCourses.length} cours sélectionné(s)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllCourses}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition-colors"
                >
                  Désélectionner
                </button>
                <button
                  onClick={deleteSelectedCourses}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Chargement des cours...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Courses Grid/List */}
        {!loading && !error && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={viewMode === 'grid'
                  ? 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden'
                  : 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-4'
                }
              >
                {viewMode === 'grid' ? (
                  /* Grid View */
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="absolute top-2 left-2 z-10 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    
                    {course.image_url && (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="max-h-full max-w-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {course.title}
                        </h3>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                          Niveau {course.level}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{course.subject}</span>
                          <span>•</span>
                          <span>{course.duration_hours}h</span>
                          <span>•</span>
                          <span>Difficulté {course.difficulty}/10</span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {course.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            Niveau {course.level}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {course.extraction_status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{course.subject}</span>
                        <span>{course.duration_hours}h</span>
                        <span>Difficulté {course.difficulty}/10</span>
                        <span>{course.topics.length} sujets</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Aucun cours ne correspond à votre recherche.'
                : 'Commencez par téléverser vos premiers cours.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowBatchUpload(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Téléverser des cours
              </button>
            )}
          </div>
        )}
      </div>

      {/* Batch Upload Modal */}
      {showBatchUpload && (
        <BatchUpload
          onUploadComplete={(newCourses) => {
            setShowBatchUpload(false)
            fetchCourses()
          }}
          onCancel={() => setShowBatchUpload(false)}
        />
      )}
    </div>
  )
}
