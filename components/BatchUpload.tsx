'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, CheckCircle, AlertCircle, BookOpen, FileText } from 'lucide-react'

interface BatchUploadProps {
  onUploadComplete?: (courses: any[]) => void
  onCancel?: () => void
}

export default function BatchUpload({ onUploadComplete, onCancel }: BatchUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [courseMetadata, setCourseMetadata] = useState<{ [key: string]: any }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      return file.type === 'application/pdf' || file.type === 'text/plain' || 
             file.type.startsWith('image/') || fileExt === 'pdf' || fileExt === 'txt' ||
             fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png' || fileExt === 'gif'
    })
    
    if (validFiles.length === 0) {
      setError('Veuillez sélectionner des fichiers PDF, TXT ou des images')
      return
    }

    setSelectedFiles(validFiles)
    setError('')
    
    // Auto-generate metadata for each file
    const metadata: { [key: string]: any } = {}
    validFiles.forEach((file, index) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileType = fileExt === 'txt' || file.type === 'text/plain' ? 'TXT' : 
                     file.type === 'application/pdf' || fileExt === 'pdf' ? 'PDF' : 'image'
      
      metadata[file.name] = {
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        description: `Cours basé sur ${fileType}: ${file.name}`,
        subject: 'général',
        level: 5,
        difficulty: 5,
        duration_hours: 10,
        topics: ['Mathématiques', 'Physique', 'Chimie'],
        learning_objectives: [
          'Comprendre les concepts fondamentaux',
          'Maîtriser les techniques de résolution',
          'Appliquer les connaissances pratiques'
        ],
        prerequisites: ['Notions de base'],
        extracted_from: fileType.toLowerCase()
      }
    })
    setCourseMetadata(metadata)
  }

  const updateMetadata = (fileName: string, field: string, value: any) => {
    setCourseMetadata(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        [field]: value
      }
    }))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins un fichier')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')
    setSuccess('')

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const metadata = courseMetadata[file.name] || {}
        
        // Create form data for each file
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', metadata.title || file.name)
        formData.append('description', metadata.description || '')
        formData.append('subject', metadata.subject || 'général')
        formData.append('level', metadata.level?.toString() || '5')
        formData.append('difficulty', metadata.difficulty?.toString() || '5')
        formData.append('duration_hours', metadata.duration_hours?.toString() || '10')
        formData.append('topics', JSON.stringify(metadata.topics || []))
        formData.append('learning_objectives', JSON.stringify(metadata.learning_objectives || []))
        formData.append('prerequisites', JSON.stringify(metadata.prerequisites || []))
        formData.append('courseId', 'new')

        const response = await fetch('/api/working-upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`)
        }

        return response.json()
      })

      // Update progress
      const results = await Promise.all(uploadPromises)
      
      setUploadProgress(100)
      setSuccess(`✅ ${results.length} cours téléversés avec succès! L'IA analyse maintenant le contenu...`)
      
      setTimeout(() => {
        onUploadComplete?.(results.map(r => r.course))
      }, 2000)

    } catch (error: any) {
      setError('Erreur lors du téléversement: ' + error.message)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            📚 Téléverser des cours en lot
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

        <div className="space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner les fichiers PDF, TXT ou images
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700"
                disabled={uploading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés: PDF, TXT, JPG, PNG, GIF (PDF/TXT max 50MB, images max 10MB)
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                📋 Fichiers sélectionnés ({selectedFiles.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-3">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    {/* Metadata Fields */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Titre du cours"
                        value={courseMetadata[file.name]?.title || ''}
                        onChange={(e) => updateMetadata(file.name, 'title', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                        disabled={uploading}
                      />
                      
                      <textarea
                        placeholder="Description du cours"
                        value={courseMetadata[file.name]?.description || ''}
                        onChange={(e) => updateMetadata(file.name, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded resize-none"
                        rows={2}
                        disabled={uploading}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Niveau"
                          min="1"
                          max="10"
                          value={courseMetadata[file.name]?.level || ''}
                          onChange={(e) => updateMetadata(file.name, 'level', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                          disabled={uploading}
                        />
                        
                        <input
                          type="number"
                          placeholder="Difficulté"
                          min="1"
                          max="10"
                          value={courseMetadata[file.name]?.difficulty || ''}
                          onChange={(e) => updateMetadata(file.name, 'difficulty', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            disabled={uploading || selectedFiles.length === 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Téléversement...
              </span>
            ) : (
              `📤 Téléverser ${selectedFiles.length} cours`
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
            <strong>🤖 Traitement IA:</strong> Après le téléversement, notre IA analysera automatiquement chaque fichier 
            pour extraire le contenu du cours (titres, descriptions, exercices, etc.) et créer des cours structurés.
          </p>
        </div>
      </div>
    </div>
  )
}
