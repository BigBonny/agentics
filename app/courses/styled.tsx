'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Header from '../../components/Header'
import ScrollingHeader from '../../components/ScrollingHeader'

interface Course {
  id: string
  title: string
  description: string
  subject: string
  level: number
  duration_hours: number
  prerequisites: string[]
  learning_objectives: string[]
  topics: string[]
  difficulty: number
  is_published: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export default function CoursesPage() {
  const { isSignedIn } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      setCourses(data)
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Erreur lors du chargement des cours')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des cours...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="text-center">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ScrollingHeader title="Nos Cours" subtitle="Découvrez notre catalogue de cours" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                    {course.subject}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                    Niveau {course.level}
                  </span>
                </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m0 6l3 3m-3-3v4m0 6l3 3" />
                  </svg>
                  <span className="ml-2">Durée: {course.duration_hours} heures</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2h2a2 2 0 002 2v6a2 2 0 002 2H7a2 2 0 00-2v6a2 2 0 002 2z" />
                  </svg>
                  <span>Difficulté: {course.difficulty}/10</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Prérequis:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.prerequisites.map((prereq, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              
              {course.learning_objectives && course.learning_objectives.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Objectifs d'apprentissage:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {course.learning_objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {course.topics && course.topics.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Sujets abordés:</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.topics.map((topic, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Voir les détails
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v1.636a1 1 0 01-1 1H5.818a1 1 0 01-1 1v1.636a1 1 0 01 1 1h5.818a1 1 0 01 1 1V6.253a1 1 0 01 1 1h-5.818a1 1 0 01 1 1z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun cours disponible</h3>
              <p className="text-gray-600 mb-6">Les cours sont en cours de préparation. Revenez plus tard!</p>
              <div className="space-y-4">
                <div className="bg-blue-50 border border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Créer un nouveau cours</h4>
                  <p className="text-blue-700 text-sm mb-4">Utilisez notre formulaire pour créer votre propre cours.</p>
                  <a href="/admin/create-course" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Créer un cours
                  </a>
                </div>
                
                <div className="bg-green-50 border border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Ajouter des exemples</h4>
                  <p className="text-green-700 text-sm mb-4">Contactez-nous pour ajouter des cours d'exemple à la base de données.</p>
                  <a href="mailto:support@agentics-revision.com" className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    Contacter le support
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
