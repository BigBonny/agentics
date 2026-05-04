'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface CourseUploadProps {
  onUploadComplete?: (course: any) => void
  onCancel?: () => void
}

export default function CourseUpload({ onUploadComplete, onCancel }: CourseUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type - accept PDF, TXT, and images
      const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/gif']
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      
      if (!validTypes.includes(file.type) && !['pdf', 'txt', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
        setError('Veuillez sélectionner un fichier PDF, TXT ou image (JPG, PNG, etc.)')
        return
      }

      // Validate file size (max 50MB for PDF/TXT, 10MB for images)
      const maxSize = file.type === 'application/pdf' || file.type === 'text/plain' || fileExt === 'pdf' || fileExt === 'txt' 
        ? 50 * 1024 * 1024 
        : 10 * 1024 * 1024
        
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
        setError(`La taille du fichier ne doit pas dépasser ${maxSizeMB}MB`)
        return
      }

      setError('')
    }
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Veuillez sélectionner un fichier (PDF, TXT ou image)')
      return
    }

    if (!title.trim()) {
      setError('Veuillez entrer un titre pour le cours')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('courseId', 'new')

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/courses/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (result.success) {
        setSuccess('✅ Cours téléversé avec succès! L\'IA analyse maintenant le contenu...')
        setTimeout(() => {
          onUploadComplete?.(result.course)
        }, 2000)
      } else {
        setError(result.error || 'Erreur lors du téléversement')
      }
    } catch (error: any) {
      setError('Erreur réseau: ' + error.message)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            📚 Téléverser un cours
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du cours
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Introduction aux mathématiques"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Description détaillée du cours..."
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier du cours
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium"
                disabled={uploading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés: PDF, TXT, JPG, PNG, GIF (PDF/TXT max 50MB, images max 10MB)
            </p>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 text-indigo-600 mr-2 animate-spin" />
                <span className="text-sm text-gray-700">
                  Téléversement en cours... {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading || !title.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Téléversement...
              </span>
            ) : (
              '📤 Téléverser le cours'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>🤖 Traitement IA:</strong> Après le téléversement, notre IA analysera automatiquement l\'image 
            pour extraire le contenu du cours (titres, descriptions, exercices, etc.).
          </p>
        </div>
      </div>
    </div>
  )
}
