'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Clock, Award, Lock, Sparkles, Brain, Calculator, FlaskConical, BookOpen, Target, Zap, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import NewHeader from '../../../components/NewHeader'
import React from 'react'

export default function GuestQuizPage() {
  const { user, isSignedIn } = useUser()
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const router = useRouter()

  // Enhanced quiz data with icons and colors
  const quizzes = [
    {
      id: 'math-basics',
      title: 'Mathématiques de Base',
      description: 'Maîtrisez les fondamentaux des mathématiques avec des exercices adaptés à votre niveau',
      duration: '15 min',
      questions: 10,
      difficulty: 'Débutant',
      icon: <Calculator className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'physics-intro',
      title: 'Physique Introduction',
      description: 'Explorez les concepts physiques fondamentaux et leur application dans la vie quotidienne',
      duration: '20 min',
      questions: 12,
      difficulty: 'Intermédiaire',
      icon: <FlaskConical className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'chemistry-fundamentals',
      title: 'Chimie Fondamentale',
      description: 'Découvrez la chimie générale avec des expériences virtuelles et des explications claires',
      duration: '18 min',
      questions: 8,
      difficulty: 'Intermédiaire',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
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
        
        // Save to database if user is logged in
        if (isSignedIn && user) {
          await saveQuizToDatabase(results, answersArray)
        }
      } else {
        console.error('Quiz submission failed:', results)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const saveQuizToDatabase = async (results: any, answersArray: string[]) => {
    try {
      console.log('Saving quiz results to database...')
      
      // Get subject from selected quiz
      const quizSubject = quizzes.find(q => q.id === selectedQuiz)?.title || 'General'
      
      // Format responses
      const responses = sampleQuestions.map((q, i) => ({
        question: q.question,
        userAnswer: answersArray[i],
        correctAnswer: q.options[q.correctAnswer],
        isCorrect: answersArray[i] === q.options[q.correctAnswer]
      }))
      
      // Calculate weaknesses and strengths
      const weaknesses: string[] = []
      const strengths: string[] = []
      
      responses.forEach((r, i) => {
        if (r.isCorrect) {
          strengths.push(`Question ${i + 1}`)
        } else {
          weaknesses.push(`Question ${i + 1}`)
        }
      })
      
      const saveResponse = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user?.id,
          subject: quizSubject,
          score: results.score,
          maxScore: results.totalQuestions,
          responses,
          feedback: {
            overall: results.message,
            weaknesses: weaknesses.slice(0, 3),
            strengths: strengths.slice(0, 3),
            recommendations: []
          }
        })
      })
      
      if (saveResponse.ok) {
        console.log('Quiz results saved to database successfully!')
      } else {
        console.error('Failed to save quiz results:', await saveResponse.text())
      }
    } catch (error) {
      console.error('Error saving quiz to database:', error)
    }
  }

  const handleCreateAccount = () => {
    router.push('/sign-up')
  }

  const handleSubscribe = () => {
    router.push('/pricing')
  }

  if (!selectedQuiz) {
    return (
      <React.Fragment>
        <NewHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 pt-24">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 text-sm font-medium mb-6 shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Évaluation Gratuite • Sans Inscription</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              Testez Vos Connaissances
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Découvrez votre niveau académique avec nos quizzes intelligents. 
              Obtenez votre score instantanément et débloquez des recommandations personnalisées.
            </p>

            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="font-medium">+10,000 évaluations</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Résultats instantanés</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Brain className="h-5 w-5 text-purple-500" />
                <span className="font-medium">IA Adaptative</span>
              </div>
            </div>
          </motion.div>

          {/* Quiz Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(quiz.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative group ${quiz.bgColor} rounded-3xl p-1 transition-all duration-500 ${hoveredCard === quiz.id ? 'scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'}`}
              >
                <div className="bg-white rounded-[22px] p-8 h-full flex flex-col">
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${quiz.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      {quiz.icon}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${quiz.bgColor} ${quiz.borderColor} border`}>
                      {quiz.difficulty}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                    {quiz.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{quiz.questions} questions</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleQuizSelect(quiz.id)}
                    className={`w-full py-4 rounded-xl bg-gradient-to-r ${quiz.color} text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group/btn`}
                  >
                    <span>Commencer</span>
                    <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-500 mb-4">
              Vous voulez accéder à plus de contenu et obtenir des recommandations personnalisées ?
            </p>
            <button 
              onClick={() => router.push('/pricing')}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              <Crown className="h-5 w-5" />
              <span>Découvrir nos offres</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
        </div>
      </React.Fragment>
    )
  }

  if (showResults && quizResults) {
    return (
      <React.Fragment>
        <NewHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Results Header with Gradient */}
            <div className={`relative bg-gradient-to-r ${quizResults.passed ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-500'} p-8 text-white text-center`}>
              <div className="absolute inset-0 bg-black/10" />
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <CheckCircle className={`h-12 w-12 ${quizResults.passed ? 'text-green-600' : 'text-orange-600'}`} />
              </motion.div>
              
              <h2 className="relative z-10 text-4xl font-bold mb-2">
                {quizResults.passed ? '🎉 Félicitations!' : '💪 Continuez à pratiquer!'}
              </h2>
              <p className="relative z-10 text-white/90 text-lg">
                {quizResults.passed ? 'Vous avez démontré d\'excellentes connaissances!' : 'Chaque effort vous rapproche de la réussite!'}
              </p>
            </div>

            {/* Score Display */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 bg-gray-50 rounded-2xl px-8 py-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {quizResults.scorePercentage}%
                    </div>
                    <div className="text-gray-500 mt-1">Score global</div>
                  </div>
                  <div className="h-12 w-px bg-gray-300" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {quizResults.score}/{quizResults.totalQuestions}
                    </div>
                    <div className="text-gray-500 mt-1">Questions correctes</div>
                  </div>
                </div>
              </div>

              {/* Performance Message */}
              <div className={`p-6 rounded-2xl mb-8 ${quizResults.passed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                <p className="text-lg text-center text-gray-700">
                  {quizResults.message}
                </p>
              </div>

              {/* Account Creation CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Créez votre compte pour continuer
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Créez un compte gratuit pour sauvegarder vos résultats et obtenir des recommandations personnalisées basées sur votre quiz.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                    <Brain className="h-6 w-6 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Sauvegardez vos scores</h4>
                      <p className="text-sm text-gray-600">Historique de vos quiz et progression</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                    <Target className="h-6 w-6 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Recommandations IA</h4>
                      <p className="text-sm text-gray-600">Cours adaptés à votre niveau</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                    <BookOpen className="h-6 w-6 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Accès aux cours</h4>
                      <p className="text-sm text-gray-600">Bibliothèque complète de ressources</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCreateAccount}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Sparkles className="h-6 w-6" />
                  <span>Créer mon compte gratuit</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <p className="text-center text-gray-500 text-sm mt-4">
                  Vous avez déjà un compte? <button onClick={() => router.push('/sign-in')} className="text-blue-600 hover:text-blue-700 font-medium">Connectez-vous</button>
                </p>
              </div>

              {/* Retake Quiz */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setSelectedQuiz(null)
                    setShowResults(false)
                    setQuizResults(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  ← Retour aux quizzes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <NewHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 pt-24">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Quiz Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Quiz en Cours</h2>
                  <p className="text-white/80 text-sm">Question {currentQuestion + 1} sur {sampleQuestions.length}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold">{Math.round(((currentQuestion + 1) / sampleQuestions.length) * 100)}%</span>
                <p className="text-white/80 text-sm">Complété</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <motion.div 
                className="bg-white h-3 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question Section */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                    <Target className="h-4 w-4" />
                    Question {currentQuestion + 1}
                  </span>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-relaxed">
                    {sampleQuestions[currentQuestion]?.question || 'Question non disponible'}
                  </h3>
                  
                  <p className="text-gray-500">
                    Sélectionnez la meilleure réponse parmi les options ci-dessous
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-4 mb-8">
                  {sampleQuestions[currentQuestion]?.options?.map((option, index) => {
                    const isSelected = answers[currentQuestion] === option
                    const letters = ['A', 'B', 'C', 'D']
                    
                    return (
                      <motion.label
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(currentQuestion, option)}
                        className={`flex items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-lg' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mr-4 transition-all duration-300 ${
                          isSelected 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {letters[index]}
                        </div>
                        <span className={`text-lg flex-grow ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                          {option}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <CheckCircle className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </motion.label>
                    )
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
                  >
                    <ArrowRight className="h-5 w-5 rotate-180" />
                    <span>Précédent</span>
                  </button>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">{currentQuestion + 1} / {sampleQuestions.length}</span>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion] || loading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                      answers[currentQuestion] && !loading
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{loading ? 'Soumission...' : currentQuestion === sampleQuestions.length - 1 ? 'Terminer' : 'Suivant'}</span>
                    {!loading && <ArrowRight className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quiz Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Répondez à toutes les questions pour obtenir votre score
          </p>
        </div>
      </div>
      </div>
      </React.Fragment>
  )
}
