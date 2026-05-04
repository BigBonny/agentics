'use client'

import { useState } from 'react'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'

export default function UploadTest() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleTestUpload = async (file: File) => {
    setUploading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', `Test: ${file.name}`)

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        setResult(data)
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDebugStorage = async () => {
    try {
      const response = await fetch('/api/debug-storage')
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🧪 Upload Debug Test</h1>

        {/* Debug Storage */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Storage Debug</h2>
          <button
            onClick={handleDebugStorage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            🔍 Debug Storage
          </button>
        </div>

        {/* Upload Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload Test</h2>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleTestUpload(file)
            }}
            disabled={uploading}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {result.success ? (
                <span className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Success
                </span>
              ) : (
                <span className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  Error Details
                </span>
              )}
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Debug Steps:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Click "🔍 Debug Storage" to check bucket status</li>
            <li>Select a PDF or image file to test upload</li>
            <li>Review the detailed results</li>
            <li>If errors persist, check the debug info</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
