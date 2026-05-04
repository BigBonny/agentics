'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Target, 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BookOpen,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react'
import NewHeader from '../../components/NewHeader'

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

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  topic: string
  difficulty: number
}

interface QuizResult {
  score: number
  total_questions: number
  percentage: number
  time_taken: number
  correct_answers: number
  incorrect_answers: number
  weaknesses: string[]
  strengths: string[]
  recommended_courses: string[]
  recommended_quizzes: string[]
  feedback: string
}

export default function QuizPage() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [questionCount, setQuestionCount] = useState(5)
  const [timeLimit, setTimeLimit] = useState(10)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!courseId) {
      router.push('/courses')
      return
    }
    
    fetchCourse()
  }, [courseId, router])

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      console.log('Timer reached 0, completing quiz...')
      completeQuiz()
    }
  }, [timeLeft, quizStarted, quizCompleted])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/courses?id=${courseId}`)
      if (!response.ok) throw new Error('Failed to fetch course')
      
      const data = await response.json()
      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQuiz = async () => {
    try {
      console.log('Starting quiz generation with settings:', { questionCount, timeLimit, courseId })
      setIsGenerating(true)
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generateCourseQuiz',
          courseId,
          questionCount,
          timeLimit,
          userId: user?.id
        }),
      })

      if (!response.ok) throw new Error('Failed to generate quiz')
      
      const data = await response.json()
      console.log('Quiz generated successfully:', data)
      setQuizQuestions(data.questions)
      setQuizStarted(true)
      setTimeLeft(timeLimit * 60) // Convert minutes to seconds
      setStartTime(Date.now())
      console.log('Quiz started with timeLeft:', timeLimit * 60)
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Erreur lors de la génération du quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz()
    }
  }

  const completeQuiz = async () => {
    try {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'evaluateQuiz',
          courseId,
          questions: quizQuestions,
          userAnswers: selectedAnswers,
          timeTaken,
          userId: user?.id
        }),
      })

      if (!response.ok) throw new Error('Failed to evaluate quiz')
      
      const result = await response.json()
      setQuizResult(result)
      setQuizCompleted(true)
      
      // Update dashboard data
      await updateDashboard(result)
    } catch (error) {
      console.error('Error evaluating quiz:', error)
      alert('Erreur lors de l\'évaluation du quiz')
    }
  }

  const updateDashboard = async (result: QuizResult) => {
    try {
      console.log('Updating dashboard with result:', result)
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'test-user-id', // Use mock ID for testing
          courseId,
          quizResult: result
        }),
      })
      
      console.log('Progress API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to update dashboard:', errorData)
        return
      }
      
      const responseData = await response.json()
      console.log('Dashboard updated successfully:', responseData)
      
    } catch (error) {
      console.error('Error updating dashboard:', error)
    }
  }

  const restartQuiz = () => {
    console.log('Restarting quiz...')
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setQuizStarted(false)
    setQuizCompleted(false)
    setQuizResult(null)
    setTimeLeft(0) // Reset to 0, will be set when quiz starts
    setStartTime(null)
    setIsGenerating(false)
    // Also reset quiz questions to force regeneration
    setQuizQuestions([])
    // Reset quiz settings to defaults
    setQuestionCount(5)
    setTimeLimit(10)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <NewHeader />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du cours...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <NewHeader />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cours non trouvé</h1>
          <button 
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour aux cours
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <NewHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!quizStarted && !quizCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz personnalisé
              </h2>
              <p className="text-gray-600">
                Générez un quiz adapté à ce cours pour tester vos connaissances
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de questions
                </label>
                <select 
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={3}>3 questions</option>
                  <option value={5}>5 questions</option>
                  <option value={10}>10 questions</option>
                  <option value={15}>15 questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite de temps (minutes)
                </label>
                <select 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Informations sur le quiz</p>
                    <p>Ce quiz sera généré par IA et adapté au contenu du cours "{course.title}".</p>
                    <p className="mt-1">Les questions couvriront les principaux sujets et objectifs d'apprentissage.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={generateQuiz}
                disabled={isGenerating}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white border-t-transparent mr-2"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Commencer le quiz
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {quizStarted && !quizCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            {/* Quiz Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Question {currentQuestion + 1}/{quizQuestions.length}</h3>
                  <p className="text-sm text-gray-500">{course.title}</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                <span className={`font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="mb-6">
              <h4 className="text-xl font-medium text-gray-900 mb-4">
                {quizQuestions[currentQuestion]?.question}
              </h4>
              
              <div className="space-y-3">
                {quizQuestions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Terminer' : 'Suivant'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        )}

        {quizCompleted && quizResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  quizResult.percentage >= 80 ? 'bg-green-100' : 
                  quizResult.percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {quizResult.percentage >= 80 ? (
                    <Award className="w-10 h-10 text-green-600" />
                  ) : quizResult.percentage >= 60 ? (
                    <Target className="w-10 h-10 text-yellow-600" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Quiz terminé !
                </h2>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span>{quizResult.correct_answers}/{quizResult.total_questions} réponses correctes</span>
                  <span>•</span>
                  <span>{Math.floor(quizResult.time_taken / 60)}:{(quizResult.time_taken % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${
                  quizResult.percentage >= 80 ? 'text-green-600' : 
                  quizResult.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {quizResult.percentage}%
                </div>
                <p className="text-gray-600 mt-1">Score final</p>
              </div>

              {/* Feedback */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Feedback</h4>
                <p className="text-gray-700">{quizResult.feedback}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={restartQuiz}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Autres cours
                </button>
              </div>
            </div>

            {/* Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Points forts</h3>
                </div>
                <ul className="space-y-2">
                  {quizResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-gray-700 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Axes d'amélioration</h3>
                </div>
                <ul className="space-y-2">
                  {quizResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span className="text-gray-700 text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Recommandations</h3>
              </div>
              
              {quizResult.recommended_courses.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Cours recommandés</h4>
                  <div className="space-y-2">
                    {quizResult.recommended_courses.map((courseName, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{courseName}</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Voir le cours →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {quizResult.recommended_quizzes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Quizs recommandés</h4>
                  <div className="space-y-2">
                    {quizResult.recommended_quizzes.map((quizName, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{quizName}</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Commencer →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
