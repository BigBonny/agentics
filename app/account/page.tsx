'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Crown,
  Calendar,
  Award,
  BookOpen,
  Target,
  Zap,
  ChevronRight,
  Edit3,
  Camera,
  Save,
  X,
  Sparkles,
  Shield,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Clock,
  Flame
} from 'lucide-react'
import NewHeader from '../../components/NewHeader'

interface UserStats {
  quizzesTaken: number
  coursesEnrolled: number
  totalPoints: number
  streakDays: number
  lastActive: string
  averageScore: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  earned: boolean
  earnedDate?: string
}

export default function AccountPage() {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'settings'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [stats] = useState<UserStats>({
    quizzesTaken: 12,
    coursesEnrolled: 5,
    totalPoints: 2450,
    streakDays: 7,
    lastActive: '2026-05-03',
    averageScore: 78
  })

  const badges: Badge[] = [
    {
      id: 'first_quiz',
      name: 'Premier Quiz',
      description: 'A complété son premier quiz',
      icon: <Target className="w-6 h-6" />,
      earned: true,
      earnedDate: '2026-04-15'
    },
    {
      id: 'streak_7',
      name: 'En Feu',
      description: '7 jours de suite actif',
      icon: <Flame className="w-6 h-6" />,
      earned: true,
      earnedDate: '2026-05-01'
    },
    {
      id: 'score_master',
      name: 'Maître du Score',
      description: 'Score moyen supérieur à 75%',
      icon: <Award className="w-6 h-6" />,
      earned: true,
      earnedDate: '2026-04-20'
    },
    {
      id: 'course_explorer',
      name: 'Explorateur',
      description: 'A rejoint 5 cours différents',
      icon: <BookOpen className="w-6 h-6" />,
      earned: true,
      earnedDate: '2026-04-25'
    }
  ]

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (user) {
      setDisplayName(user.firstName || user.username || '')
    }
  }, [user, isSignedIn, isLoaded, router])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    setIsEditing(false)
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <>
        <NewHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
        </div>
      </>
    )
  }

  return (
    <>
      <NewHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 p-4 sm:p-6 lg:p-8 text-white">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white text-violet-600 p-1.5 sm:p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                    <span className="text-white/80 text-xs sm:text-sm font-medium">Membre Premium</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-white/20 backdrop-blur-sm text-white placeholder-white/60 px-4 py-2 rounded-xl border border-white/30 focus:outline-none focus:border-white/60"
                        placeholder="Votre nom"
                      />
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{displayName || user?.firstName || user?.username || 'Utilisateur'}</h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-white/70 flex items-center gap-2 justify-center md:justify-start mt-1">
                    <Mail className="w-4 h-4" />
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-row md:flex-col gap-2 sm:gap-3 w-full md:w-auto">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 md:flex-none bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Tableau de Bord</span>
                    <span className="sm:hidden">Dashboard</span>
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-6">
              {[
                { icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />, value: stats.coursesEnrolled, label: 'Cours' },
                { icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />, value: stats.quizzesTaken, label: 'Quiz' },
                { icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />, value: stats.totalPoints, label: 'Points' },
                { icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5" />, value: stats.streakDays, label: 'Jours' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-100"
                >
                  <div className="text-violet-600 mb-1 sm:mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Badges</h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        badge.earned
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          badge.earned ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gray-200'
                        }`}>
                          {badge.earned ? (
                            <span className="text-white">{badge.icon}</span>
                          ) : (
                            <span className="text-gray-400">{badge.icon}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${badge.earned ? 'text-gray-900' : 'text-gray-400'}`}>
                            {badge.name}
                          </h3>
                          <p className="text-sm text-gray-500">{badge.description}</p>
                          {badge.earnedDate && (
                            <p className="text-xs text-amber-600 mt-1">
                              Obtenu le {new Date(badge.earnedDate).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Activity & Settings */}
            <div className="lg:col-span-2 space-y-8">
                {/* Tab Navigation */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-1 flex gap-1 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', shortLabel: 'Aperçu', icon: <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> },
                  { id: 'stats', label: 'Statistiques', shortLabel: 'Stats', icon: <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" /> },
                  { id: 'settings', label: 'Paramètres', shortLabel: 'Réglages', icon: <Settings className="w-3 h-3 sm:w-4 sm:h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Recent Activity */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Activité Récente</h2>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { action: 'Quiz complété', subject: 'Mathématiques Avancées', score: '85%', time: 'Il y a 2 heures', color: 'from-green-500 to-emerald-500' },
                          { action: 'Cours rejoint', subject: 'Physique Quantique', score: null, time: 'Il y a 1 jour', color: 'from-blue-500 to-cyan-500' },
                          { action: 'Badge obtenu', subject: 'Maître du Score', score: null, time: 'Il y a 2 jours', color: 'from-amber-500 to-orange-500' }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center flex-shrink-0`}>
                              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{activity.action}</h4>
                              <p className="text-xs sm:text-sm text-gray-500">{activity.subject}</p>
                              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                            </div>
                            {activity.score && (
                              <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0">
                                {activity.score}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 space-y-4 sm:space-y-6"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Vos Statistiques</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl sm:rounded-2xl border border-violet-100">
                        <div className="text-3xl sm:text-4xl font-bold text-violet-600 mb-1 sm:mb-2">{stats.averageScore}%</div>
                        <div className="text-gray-600 text-sm sm:text-base">Score moyen</div>
                      </div>
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-blue-100">
                        <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">{stats.quizzesTaken}</div>
                        <div className="text-gray-600 text-sm sm:text-base">Quiz complétés</div>
                      </div>
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl border border-amber-100">
                        <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-1 sm:mb-2">{stats.streakDays}</div>
                        <div className="text-gray-600 text-sm sm:text-base">Jours de suite</div>
                      </div>
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl sm:rounded-2xl border border-pink-100">
                        <div className="text-3xl sm:text-4xl font-bold text-pink-600 mb-1 sm:mb-2">{stats.totalPoints}</div>
                        <div className="text-gray-600 text-sm sm:text-base">Points totaux</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 space-y-4 sm:space-y-6"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Paramètres</h2>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h4>
                            <p className="text-xs sm:text-sm text-gray-500">Recevoir des alertes email</p>
                          </div>
                        </div>
                        <div className="w-10 sm:w-12 h-5 sm:h-6 bg-violet-600 rounded-full relative flex-shrink-0">
                          <div className="absolute right-0.5 sm:right-1 top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Sécurité</h4>
                            <p className="text-xs sm:text-sm text-gray-500">Authentification à deux facteurs</p>
                          </div>
                        </div>
                        <button className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors flex-shrink-0">
                          Configurer
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Profil Public</h4>
                            <p className="text-xs sm:text-sm text-gray-500">Rendre votre profil visible</p>
                          </div>
                        </div>
                        <div className="w-10 sm:w-12 h-5 sm:h-6 bg-gray-300 rounded-full relative flex-shrink-0">
                          <div className="absolute left-0.5 sm:left-1 top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
