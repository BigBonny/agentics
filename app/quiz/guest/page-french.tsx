'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Clock, Award, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GuestQuizPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Quiz sample data
  const quizzes = [
    {
      id: 'math-basics',
      title: 'Mathématiques de Base',
      description: 'Testez vos connaissances en mathématiques fondamentales',
      duration: '15 minutes',
      questions: 10,
      difficulty: 'Débutant'
    },
    {
      id: 'physics-intro',
      title: 'Physique Introduction',
      description: 'Évaluez votre compréhension des concepts physiques de base',
      duration: '20 minutes',
      questions: 12,
      difficulty: 'Intermédiaire'
    },
    {
      id: 'chemistry-fundamentals',
      title: 'Chimie Fondamentale',
      description: 'Testez vos connaissances en chimie générale',
      duration: '18 minutes',
      questions: 8,
      difficulty: 'Intermédiaire'
    }
  ]

  const sampleQuestions = [
    {
      id: 1,
      question: 'Quelle est la dérivée de f(x) = 3x² + 2x - 1 ?',
      options: ['f\'(x) = 6x + 2', 'f\'(x) = 3x + 2', 'f\'(x) = 6x', 'f\'(x) = 3x²'],
      correctAnswer: 0
    },
    {
      id: 2,
      question: 'Résolvez l\'équation: 2x + 5 = 13',
      options: ['x = 4', 'x = 8', 'x = 3', 'x = 6'],
      correctAnswer: 0
    },
    {
      id: 3,
      question: 'Quelle est la valeur de sin(90°) ?',
      options: ['0', '1', '1/2', 'sqrt(2)/2'],
      correctAnswer: 1
    }
  ]

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuiz(quizId)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setQuizResults(null)
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    setLoading(true)
    
    try {
      const answersArray = sampleQuestions.map((_, index) => answers[index] || '')
      
      const response = await fetch('/api/quiz/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: selectedQuiz,
          answers: answersArray
        })
      })

      const results = await response.json()
      
      if (response.ok) {
        setQuizResults(results)
        setShowResults(true)
      } else {
        console.error('Quiz submission failed:', results)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = () => {
    router.push('/pricing')
  }

  if (!selectedQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Testez Vos Connaissances
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Choisissez un quiz pour évaluer votre niveau gratuitement
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Pas d'inscription requise</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {quiz.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{quiz.questions} questions</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleQuizSelect(quiz.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Commencer le Quiz
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showResults && quizResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                quizResults.passed ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <CheckCircle className={`h-10 w-10 ${quizResults.passed ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {quizResults.passed ? 'Félicitations!' : 'Continuez à pratiquer!'}
              </h2>
              
              <p className="text-xl text-gray-600 mb-6">
                Votre score: <span className="font-bold text-2xl">{quizResults.score}/{quizResults.totalQuestions}</span>
                ({quizResults.scorePercentage}%)
              </p>
              
              <p className="text-gray-700 mb-8">{quizResults.message}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Débloquez des fonctionnalités premium
              </h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Recommandations personnalisées basées sur vos résultats</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Accès complet à notre bibliothèque de cours</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Plan d'étude personnalisé</span>
                </li>
              </ul>
              
              <button
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                S'abonner pour débloquer tout
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Quiz en Cours</h2>
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} / {sampleQuestions.length}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {sampleQuestions[currentQuestion].question}
            </h3>
            
            <div className="space-y-3">
              {sampleQuestions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={() => handleAnswerSelect(currentQuestion, option)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion] || loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Soumission...' : currentQuestion === sampleQuestions.length - 1 ? 'Soumettre' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
