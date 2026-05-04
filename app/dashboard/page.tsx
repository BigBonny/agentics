'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabaseAdmin } from '../../lib/supabase'
import {
  Sparkles, Crown, Star, TrendingUp, Clock, Award, Brain,
  Target, BookOpen, Zap, Lock, ArrowRight, CheckCircle,
  BarChart3, GraduationCap, ChevronRight, Flame, Plus
} from 'lucide-react'
import NewHeader from '../../components/NewHeader'
import NewFooter from '../../components/NewFooter'

// Mock data for demonstration
const mockProgress = [
  { day: 'Lun', score: 65 },
  { day: 'Mar', score: 72 },
  { day: 'Mer', score: 68 },
  { day: 'Jeu', score: 85 },
  { day: 'Ven', score: 78 },
  { day: 'Sam', score: 92 },
  { day: 'Dim', score: 88 }
]

const mockAchievements = [
  { icon: Star, name: 'Premier Quiz', desc: 'Complétez votre premier quiz', unlocked: true },
  { icon: Flame, name: 'Série Gagnante', desc: '5 quizzes consécutifs', unlocked: true },
  { icon: Target, name: 'Expert', desc: 'Scorez 90% ou plus', unlocked: false },
  { icon: Crown, name: 'Champion', desc: '10 quizzes complétés', unlocked: false }
]

const premiumFeatures = [
  { icon: Brain, name: 'Quiz IA Illimités', desc: 'Accès à tous les quizzes intelligents', locked: false },
  { icon: Target, name: 'Analyse Avancée', desc: 'Détection précise des points faibles', locked: false },
  { icon: TrendingUp, name: 'Suivi Détaillé', desc: 'Graphiques et statistiques complètes', locked: false },
  { icon: BookOpen, name: 'Cours Personnalisés', desc: 'Contenu adapté à votre niveau', locked: true },
  { icon: Zap, name: 'Mode Accéléré', desc: 'Sessions d\'entraînement intensives', locked: true },
  { icon: Award, name: 'Certifications', desc: 'Badges et certificats officiels', locked: true }
]

export default function Dashboard() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'quiz' | 'progress' | 'achievements'>('overview')

  const isSuccess = searchParams.get('success') === 'true'
  const hasSubscription = userData?.subscription_tier === 'premium'

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) {
          setUserData({
            clerk_id: 'test-user-id',
            email: 'test@example.com',
            first_name: 'Invité',
            last_name: '',
            subscription_tier: 'free',
            subscription_status: 'active'
          })
          setLoading(false)
          return
        }

        // Create or fetch user
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single()

        if (!existingUser) {
          const { data: newUser } = await supabaseAdmin
            .from('users')
            .insert({
              clerk_id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress || '',
              first_name: user.firstName || '',
              last_name: user.lastName || '',
              subscription_tier: 'free',
              subscription_status: 'active'
            })
            .select()
            .single()
          setUserData(newUser)
        } else {
          if (isSuccess) {
            await supabaseAdmin
              .from('users')
              .update({ subscription_tier: 'premium', subscription_status: 'active' })
              .eq('clerk_id', user.id)
            existingUser.subscription_tier = 'premium'
          }
          setUserData(existingUser)
        }

        // Fetch courses (all courses including unpublished)
        const { data: coursesData } = await supabaseAdmin
          .from('courses')
          .select('*')
        setCourses(coursesData || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, isSuccess])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  // Success State
  if (isSuccess && hasSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <NewHeader />
        <div className="pt-32 pb-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Crown className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue dans Premium!</h1>
            <p className="text-gray-600 mb-8">
              Votre abonnement est actif. Profitez maintenant de toutes les fonctionnalités exclusives.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-premium"
            >
              Découvrir Mon Espace Premium
            </button>
          </motion.div>
        </div>
        <NewFooter />
      </div>
    )
  }

  // Free User - Upgrade Prompt
  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <NewHeader />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6">
                <Star className="h-4 w-4 text-amber-600" />
                <span className="text-amber-700 font-medium">Passage à Premium Recommandé</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gray-900">Débloquez votre </span>
                <span className="gradient-text">potentiel complet</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Vous utilisez actuellement la version gratuite. Passez à Premium pour accéder à toutes les fonctionnalités et maximiser votre réussite.
              </p>
            </motion.div>

            {/* Stats Preview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="card-glass p-6 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">3/3</div>
                <p className="text-gray-600">Quizzes utilisés ce mois</p>
              </div>
              <div className="card-glass p-6 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">75%</div>
                <p className="text-gray-600">Score moyen</p>
              </div>
              <div className="card-glass p-6 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">12h</div>
                <p className="text-gray-600">Temps d'étude</p>
              </div>
            </div>

            {/* Premium CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <Crown className="h-16 w-16 text-amber-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Passez à Premium Aujourd'hui</h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  Rejoignez plus de 10,000 étudiants qui ont déjà amélioré leurs résultats avec nos fonctionnalités premium.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4"
                  >
                    <Crown className="h-5 w-5" />
                    <span>Voir les Offres Premium</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Feature Preview */}
            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`card-premium p-6 relative ${feature.locked ? 'opacity-60' : ''}`}
                >
                  {feature.locked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    feature.locked
                      ? 'bg-gray-100'
                      : 'bg-gradient-to-r from-violet-500 to-purple-500'
                  }`}>
                    <feature.icon className={`h-6 w-6 ${feature.locked ? 'text-gray-400' : 'text-white'}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.name}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <NewFooter />
      </div>
    )
  }

  // Premium Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <NewHeader />

      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Bonjour, {userData?.first_name || 'Étudiant'}!
                  </h1>
                  <span className="badge-premium flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </span>
                </div>
                <p className="text-gray-600">
                  Votre espace d'apprentissage personnalisé • Niveau: Intermédiaire
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: TrendingUp, label: 'Score Moyen', value: '78%', color: 'from-violet-500 to-purple-500' },
              { icon: Clock, label: 'Temps d\'Étude', value: '24h', color: 'from-cyan-500 to-blue-500' },
              { icon: Award, label: 'Quizzes', value: '12', color: 'from-amber-500 to-orange-500' },
              { icon: Flame, label: 'Série', value: '5 jours', color: 'from-rose-500 to-pink-500' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-glass p-6"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-glass p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-violet-600" />
                    Progression de la Semaine
                  </h3>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +23%
                  </span>
                </div>
                <div className="h-48 flex items-end justify-between gap-2">
                  {mockProgress.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-violet-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-violet-400 hover:to-purple-400"
                        style={{ height: `${day.score}%` }}
                      />
                      <span className="text-xs text-gray-600">{day.day}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid md:grid-cols-2 gap-4"
              >
                <div 
                  onClick={() => router.push('/quiz/guest')}
                  className="card-premium p-6 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Quiz IA Adaptatif</h4>
                  <p className="text-gray-600 text-sm mb-4">Générez un quiz personnalisé basé sur vos progrès</p>
                  <div className="flex items-center text-violet-600 font-medium group-hover:gap-2 transition-all">
                    <span>Commencer</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                <div 
                  onClick={() => router.push('/courses')}
                  className="card-premium p-6 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Analyse des Faiblesses</h4>
                  <p className="text-gray-600 text-sm mb-4">Identifiez vos points à améliorer</p>
                  <div className="flex items-center text-violet-600 font-medium group-hover:gap-2 transition-all">
                    <span>Voir les cours</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>

              {/* Courses Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-glass p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-violet-600" />
                    Cours Disponibles
                  </h3>
                  <button
                    onClick={() => router.push('/courses')}
                    className="text-violet-600 font-medium hover:text-violet-700 flex items-center gap-1"
                  >
                    Voir tout
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {courses.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.slice(0, 6).map((course, i) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="card-premium p-4 hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => router.push(`/courses`)}
                      >
                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full">{course.subject}</span>
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Niveau {course.level}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucun cours disponible pour le moment</p>
                    <button
                      onClick={() => router.push('/courses')}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Explorer la bibliothèque</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-glass p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Succès Débloqués
                </h3>
                <div className="space-y-4">
                  {mockAchievements.map((achievement, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        achievement.unlocked
                          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100'
                          : 'bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        achievement.unlocked
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                          : 'bg-gray-200'
                      }`}>
                        <achievement.icon className={`h-5 w-5 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{achievement.name}</div>
                        <div className="text-xs text-gray-500">{achievement.desc}</div>
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Study Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card-glass p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-rose-500" />
                  Série d'Étude
                </h3>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold gradient-text mb-2">5</div>
                  <p className="text-gray-600">Jours consécutifs</p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div
                      key={day}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        day <= 5
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day <= 5 ? <CheckCircle className="h-4 w-4" /> : day}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Next Recommended */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  <span className="font-medium text-amber-300">Recommandé pour vous</span>
                </div>
                {courses.length > 0 ? (
                  <>
                    <h4 className="font-bold text-lg mb-2">{courses[0].title}</h4>
                    <p className="text-white/80 text-sm mb-4">
                      {courses[0].description || 'Basé sur vos récentes performances, ce cours vous aidera à progresser.'}
                    </p>
                    <button 
                      onClick={() => router.push('/courses')}
                      className="w-full py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Voir tous les cours</span>
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-lg mb-2">Cours bientôt disponibles</h4>
                    <p className="text-white/80 text-sm mb-4">
                      Nous préparons du contenu personnalisé pour vous.
                    </p>
                    <button 
                      onClick={() => router.push('/courses')}
                      className="w-full py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Explorer la bibliothèque</span>
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <NewFooter />
    </div>
  )
}
