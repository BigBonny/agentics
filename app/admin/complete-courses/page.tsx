'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  Crown,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import NewHeader from '../../../components/NewHeader'

export default function CompleteCoursesPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    details?: {
      enrollmentsUpdated: number
      progressRecordsCreated: number
      errors: string[]
    }
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/complete-all-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim() })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteMyCourses = async () => {
    if (!user?.id) return
    setUserId(user.id)
    
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/complete-all-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isSignedIn) {
    return (
      <>
        <NewHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion Requise</h1>
            <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NewHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 pt-24 pb-12 px-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au Dashboard
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Compléter les Cours</h1>
            <p className="text-gray-600">Marquer tous les cours comme terminés pour un utilisateur</p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8"
          >
            {/* Quick Action for Current User */}
            <div className="mb-8 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-5 h-5 text-violet-600" />
                <span className="font-semibold text-gray-900">Action Rapide</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Marquer tous les cours comme terminés pour votre compte ({user?.id?.slice(0, 15)}...)
              </p>
              <button
                onClick={handleCompleteMyCourses}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && userId === user?.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Compléter Mes Cours
                  </>
                )}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-gray-500 text-sm">ou</span>
              </div>
            </div>

            {/* Form for Specific User */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Utilisateur (Clerk ID)
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="user_xxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Entrez l'ID Clerk de l'utilisateur pour lequel vous souhaitez compléter tous les cours.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !userId.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && userId !== user?.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Compléter pour cet Utilisateur
                  </>
                )}
              </button>
            </form>

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-2xl ${
                  result.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {result.success ? 'Succès!' : 'Erreur'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.message}
                    </p>
                    
                    {result.success && result.details && (
                      <div className="mt-3 space-y-1 text-sm text-green-700">
                        <p>• {result.details.enrollmentsUpdated} cours mis à jour</p>
                        <p>• {result.details.progressRecordsCreated} leçons marquées comme terminées</p>
                        {result.details.errors.length > 0 && (
                          <p className="text-amber-600">• {result.details.errors.length} erreurs</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4"
          >
            <h4 className="font-semibold text-blue-900 mb-2">Comment trouver un Clerk ID ?</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Allez sur le dashboard Clerk</li>
              <li>Cliquez sur "Users" dans le menu</li>
              <li>Trouvez l'utilisateur souhaité</li>
              <li>L'ID commence par "user_"</li>
            </ol>
          </motion.div>
        </div>
      </div>
    </>
  )
}
