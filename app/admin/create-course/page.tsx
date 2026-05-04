'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '../../../components/ui/Button'
import Header from '../../../components/Header'
import ScrollingHeader from '../../../components/ScrollingHeader'

export default function CreateCourse() {
  const { isSignedIn } = useUser()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'mathématiques',
    level: 5,
    duration_hours: 10,
    prerequisites: [] as string[],
    learning_objectives: [] as string[],
    topics: [] as string[],
    difficulty: 5,
    is_published: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const course = await response.json()
        setMessage(`Cours "${course.title}" créé avec succès!`)
        // Reset form
        setFormData({
          title: '',
          description: '',
          subject: 'mathématiques',
          level: 5,
          duration_hours: 10,
          prerequisites: [],
          learning_objectives: [],
          topics: [],
          difficulty: 5,
          is_published: false
        })
      } else {
        const error = await response.json()
        setMessage(`Erreur: ${error.error}`)
      }
    } catch (error) {
      setMessage(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleArrayInput = (field: 'prerequisites' | 'learning_objectives' | 'topics', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({ ...prev, [field]: items }))
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion Requise</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour créer un cours.</p>
          <Button href="/sign-in" variant="primary">
            Se connecter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-16">
      <Header />
      <ScrollingHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Créer un Nouveau Cours</h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du cours *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Algèbre Linéaire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matière *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="mathématiques">Mathématiques</option>
                  <option value="physique">Physique</option>
                  <option value="chimie">Chimie</option>
                  <option value="biologie">Biologie</option>
                  <option value="informatique">Informatique</option>
                  <option value="français">Français</option>
                  <option value="histoire">Histoire</option>
                  <option value="géographie">Géographie</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Description détaillée du cours..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau (1-10) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (heures) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.duration_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulté (1-10) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prérequis (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.prerequisites.join(', ')}
                onChange={(e) => handleArrayInput('prerequisites', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Notions de base en algèbre, Calcul différentiel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectifs d'apprentissage (séparés par des virgules) *
              </label>
              <input
                type="text"
                required
                value={formData.learning_objectives.join(', ')}
                onChange={(e) => handleArrayInput('learning_objectives', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Résoudre des équations linéaires, Comprendre les matrices, Appliquer les transformations"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujets couverts (séparés par des virgules) *
              </label>
              <input
                type="text"
                required
                value={formData.topics.join(', ')}
                onChange={(e) => handleArrayInput('topics', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Vecteurs, Matrices, Espaces vectoriels, Applications linéaires"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_published" className="text-sm text-gray-700">
                Publier immédiatement
              </label>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="px-8 py-3"
              >
                {loading ? 'Création...' : 'Créer le cours'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
