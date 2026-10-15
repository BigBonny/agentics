'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Upload,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Layers,
  ListChecks,
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import Header from '../../../components/Header'

const SUBJECTS = [
  'mathématiques',
  'physique',
  'chimie',
  'biologie',
  'informatique',
  'français',
  'histoire',
  'géographie',
  'économie',
  'gestion',
]

const emptyForm = {
  title: '',
  description: '',
  subject: 'mathématiques',
  level: 5,
  duration_hours: 10,
  prerequisites: [] as string[],
  learning_objectives: [] as string[],
  topics: [] as string[],
  difficulty: 5,
  is_published: false,
}

export default function CreateCourse() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setCreatedId(null)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const course = await response.json()
        setMessage(`Cours "${course.title}" créé avec succès !`)
        setCreatedId(course.id)
        setFormData(emptyForm)
      } else {
        const error = await response.json()
        setMessage(`Erreur : ${error.error}`)
      }
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour créer un cours.</p>
          <Button href="/sign-in" variant="primary">Se connecter</Button>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        <button
          onClick={() => router.push('/admin/courses')}
          className="flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux cours
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
              Créer un nouveau cours
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Remplissez les informations du cours, puis ajoutez les chapitres dans l'éditeur.
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-6 p-4 rounded-xl flex items-start ${
                message.includes('succès')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.includes('succès') && <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />}
              <div>
                <p>{message}</p>
                {createdId && (
                  <button
                    onClick={() => router.push(`/admin/courses/${createdId}`)}
                    className="mt-2 text-sm font-medium text-green-900 underline hover:text-green-700"
                  >
                    → Ajouter des chapitres à ce cours
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-indigo-600" />
                Informations générales
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Titre du cours *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputClass}
                    placeholder="Ex : Comptabilité générale — Chapitre 1"
                  />
                </div>
                <div>
                  <label className={labelClass}>Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={inputClass}
                    placeholder="Description détaillée du cours…"
                  />
                </div>
                <div>
                  <label className={labelClass}>Matière *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={inputClass}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Paramètres */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Layers className="w-4 h-4 mr-2 text-indigo-600" />
                Paramètres
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>
                    Niveau : <span className="font-semibold text-indigo-600">{formData.level}/10</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: +e.target.value })}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Difficulté : <span className="font-semibold text-indigo-600">{formData.difficulty}/10</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: +e.target.value })}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className={labelClass}>Durée (heures) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: +e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Programme */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-1 flex items-center">
                <ListChecks className="w-4 h-4 mr-2 text-indigo-600" />
                Programme
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Appuyez sur Entrée après chaque élément pour l'ajouter.
              </p>
              <div className="space-y-4">
                <TagInput
                  label="Objectifs d'apprentissage *"
                  required
                  values={formData.learning_objectives}
                  onChange={(v) => setFormData({ ...formData, learning_objectives: v })}
                  placeholder="Ex : Résoudre des équations linéaires"
                  accent="bg-indigo-100 text-indigo-800"
                />
                <TagInput
                  label="Sujets couverts *"
                  required
                  values={formData.topics}
                  onChange={(v) => setFormData({ ...formData, topics: v })}
                  placeholder="Ex : Vecteurs"
                  accent="bg-emerald-100 text-emerald-800"
                />
                <TagInput
                  label="Prérequis"
                  values={formData.prerequisites}
                  onChange={(v) => setFormData({ ...formData, prerequisites: v })}
                  placeholder="Ex : Notions de base en algèbre"
                  accent="bg-amber-100 text-amber-800"
                />
              </div>
            </section>

            {/* Publication + submit */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.is_published}
                  onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    formData.is_published ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                      formData.is_published ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700">
                  Publier immédiatement
                  <span className="block text-xs text-gray-400">
                    Visible par les élèves dès la création
                  </span>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création…
                  </>
                ) : (
                  'Créer le cours'
                )}
              </button>
            </section>
          </form>

          <p className="text-xs text-gray-400 mt-6 flex items-center">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Astuce : pour créer un cours depuis un PDF avec extraction automatique des chapitres,
            utilisez le bouton « Téléverser » sur la page{' '}
            <button onClick={() => router.push('/admin/courses')} className="underline ml-1 hover:text-indigo-600">
              Gestion des cours
            </button>
            .
          </p>
        </motion.div>
      </main>
    </div>
  )
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
  required,
  accent,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  required?: boolean
  accent: string
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 p-2 transition-colors">
        {values.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {values.map((v) => (
              <span key={v} className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full ${accent}`}>
                {v}
                <button
                  type="button"
                  onClick={() => onChange(values.filter((x) => x !== v))}
                  className="ml-1.5 opacity-60 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            } else if (e.key === 'Backspace' && !input && values.length) {
              onChange(values.slice(0, -1))
            }
          }}
          onBlur={add}
          required={required && values.length === 0}
          className="w-full bg-transparent outline-none text-sm px-1.5 py-1"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
