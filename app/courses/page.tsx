'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  BarChart3, 
  ChevronRight, 
  AlertCircle,
  Plus,
  Mail,
  Search,
  GraduationCap,
  Sparkles,
  Target,
  Layers,
  Brain
} from 'lucide-react'
import NewHeader from '../../components/NewHeader'
import NewFooter from '../../components/NewFooter'
import CourseUpload from '../../components/CourseUpload'

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

// Animation variants for staggered grid
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
}

// 3D Tilt Card Component
const CourseCard = ({ course, index }: { course: Course; index: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 })
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"])
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Subject color mapping
  const subjectColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    'Informatique': { 
      bg: 'bg-violet-100', 
      text: 'text-violet-700', 
      border: 'border-violet-200',
      gradient: 'from-violet-500/20 to-purple-500/20'
    },
    'Design': { 
      bg: 'bg-pink-100', 
      text: 'text-pink-700', 
      border: 'border-pink-200',
      gradient: 'from-pink-500/20 to-rose-500/20'
    },
    'Technologie': { 
      bg: 'bg-cyan-100', 
      text: 'text-cyan-700', 
      border: 'border-cyan-200',
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    'Data Science': { 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-700', 
      border: 'border-emerald-200',
      gradient: 'from-emerald-500/20 to-teal-500/20'
    },
    'default': { 
      bg: 'bg-indigo-100', 
      text: 'text-indigo-700', 
      border: 'border-indigo-200',
      gradient: 'from-indigo-500/20 to-blue-500/20'
    }
  }
  
  const colors = subjectColors[course.subject] || subjectColors.default

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={cardVariants}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-full"
    >
      <div className={`
        relative h-full rounded-2xl border shadow-lg
        bg-white ${colors.border}
        transition-all duration-500 ease-out
        group-hover:shadow-2xl group-hover:shadow-${colors.gradient.split('-')[1]}-500/20
        overflow-hidden
      `}>
        {/* Gradient Background on Hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${colors.gradient} 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        `} />
        
        {/* Glow Effect */}
        <div className={`
          absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 
          transition-opacity duration-500 blur-xl
          bg-gradient-to-r from-transparent via-white/10 to-transparent
        `} />

        <div className="relative p-6 flex flex-col h-full">
          {/* Header: Subject & Level */}
          <div className="flex items-center justify-between mb-4">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${colors.bg} ${colors.text} border ${colors.border}
              `}
            >
              
              {course.subject}
            </motion.span>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Niveau {course.level}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-900 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
            {course.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg p-2.5 border border-gray-200">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg p-2.5 border border-gray-200">
              <Target className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-medium">Diff. {course.difficulty}/10</span>
            </div>
          </div>

          {/* Topics Pills */}
          {course.topics && course.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {course.topics.slice(0, 3).map((topic, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  {topic}
                </motion.span>
              ))}
              {course.topics.length > 3 && (
                <span className="px-2.5 py-1 text-gray-500 text-xs">
                  +{course.topics.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Prerequisites Preview */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Layers className="w-3 h-3" />
                <span>Prérequis</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {course.prerequisites.slice(0, 2).map((prereq, i) => (
                  <span key={i} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    {prereq}
                  </span>
                ))}
                {course.prerequisites.length > 2 && (
                  <span className="text-xs text-gray-500 px-1">+{course.prerequisites.length - 2}</span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = `/quiz?courseId=${course.id}`}
            className={`
              w-full py-3 px-4 rounded-xl font-semibold text-sm
              bg-gradient-to-r from-indigo-600 to-violet-600 
              hover:from-indigo-500 hover:to-violet-500
              text-white shadow-lg shadow-indigo-500/25
              flex items-center justify-center gap-2
              transition-all duration-300
              group/btn
            `}
          >
            <span>Commencer le quiz</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </motion.button>
          
          {/* Secondary Action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = `/quiz?courseId=${course.id}`}
            className={`
              w-full py-2 px-4 rounded-xl text-sm
              bg-gray-100 hover:bg-gray-200 text-gray-700
              flex items-center justify-center gap-2
              transition-all duration-300
              mt-2
            `}
          >
            <Brain className="w-4 h-4" />
            <span>Voir les détails</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}


// Empty State Component
const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="col-span-full flex flex-col items-center justify-center py-20 px-4"
  >
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-100/20 blur-3xl rounded-full" />
      <div className="relative bg-white rounded-2xl p-8 md:p-12 max-w-2xl w-full shadow-lg border border-gray-200">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-200"
          >
            <BookOpen className="w-8 h-8 text-gray-400" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Aucun cours disponible
          </h3>
          <p className="text-gray-600 mb-8 max-w-md">
            Les cours sont en cours de préparation. Revenez plus tard ou contribuez à la plateforme en créant votre propre contenu.
          </p>

          <div className="grid md:grid-cols-2 gap-4 w-full">
            <motion.a
              href="/admin/create-course"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-6 rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-300 hover:bg-gray-100 transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                <Plus className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Créer un cours</h4>
              <p className="text-sm text-gray-500 text-center">Utilisez notre formulaire intuitif</p>
            </motion.a>

            <motion.a
              href="mailto:support@agentics-revision.com"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-6 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-300 hover:bg-gray-100 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Contacter le support</h4>
              <p className="text-sm text-gray-500 text-center">Demandez des cours d'exemple</p>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
)

// Loading Skeleton
const CourseSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 h-[420px] animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-6 w-24 bg-gray-200 rounded-full" />
      <div className="h-6 w-20 bg-gray-200 rounded" />
    </div>
    <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
    <div className="space-y-2 mb-6">
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-lg" />
    </div>
    <div className="h-12 w-full bg-gray-200 rounded-xl mt-auto" />
  </div>
)

export default function CoursesPage() {
  const { isSignedIn } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // YOUR ORIGINAL BACKEND LOGIC - UNCHANGED
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

  // Filter courses based on search and subject
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject ? course.subject === selectedSubject : true
    return matchesSearch && matchesSubject
  })

  // Get unique subjects for filter
  const subjects = Array.from(new Set(courses.map(c => c.subject)))

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <NewHeader />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full mb-6"
              />
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 text-lg font-medium"
              >
                Chargement des cours...
              </motion.p>
            </div>
            
            {/* Skeleton Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[...Array(6)].map((_, i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
        <NewFooter />
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <NewHeader />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6 border border-red-200">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchCourses}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium transition-colors"
              >
                Réessayer
              </motion.button>
            </motion.div>
          </div>
        </div>
        <NewFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <NewHeader />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-12 px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30" />
        </div>
        
        {/* Search & Filter Section */}
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">Découvrez nos </span>
              <span className="gradient-text">cours</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explorez notre bibliothèque de cours interactifs et améliorez vos compétences.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto mb-8"
          >
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-sm"
              />
            </div>
            
            {/* Subject Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSubject(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSubject === null 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Tous
              </motion.button>
              {subjects.map((subject) => (
                <motion.button
                  key={subject}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSubject(subject === selectedSubject ? null : subject)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSubject === subject 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {subject}
                </motion.button>
              ))}
            </div>
            
            {/* Upload Button */}
            {isSignedIn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-violet-500/25"
              >
                <Plus className="w-4 h-4" />
                Téléverser
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-8 text-sm text-gray-600"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-600" />
            <span>{filteredCourses.length} cours disponibles</span>
          </div>
          {isSignedIn && (
            <div className="flex items-center gap-2 text-violet-600">
              <Sparkles className="w-4 h-4" />
              <span>Accès premium actif</span>
            </div>
          )}
        </motion.div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </motion.div>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <CourseUpload
          onUploadComplete={(course) => {
            setShowUploadModal(false)
            fetchCourses()
          }}
          onCancel={() => setShowUploadModal(false)}
        />
      )}

      <NewFooter />
    </div>
  )
}