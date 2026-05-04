'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Shield, Star, Play, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewHero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-white/90 text-sm font-medium">L'apprentissage de demain, aujourd'hui</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Maîtrisez vos
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
                examens avec l'IA
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/70 mb-8 max-w-lg">
              Des quiz intelligents, des recommandations personnalisées et un suivi de progrès complet. 
              Rejoignez plus de <span className="text-amber-400 font-semibold">10,000 étudiants</span> qui réussissent avec nous.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/pricing')}
                className="btn-premium group"
              >
                <Sparkles className="h-5 w-5" />
                <span>Commencer Gratuitement</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/quiz/guest')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Play className="h-5 w-5" />
                <span>Essayer un Quiz Gratuit</span>
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-sm">Paiement Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <span className="text-sm">Résultats Instantanés</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">4.9/5 Évaluation</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              >
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Quiz IA Adaptatif</h3>
                    <p className="text-white/60 text-sm">Niveau: Intermédiaire</p>
                  </div>
                  <div className="ml-auto">
                    <span className="badge-premium">Premium</span>
                  </div>
                </div>

                {/* Question Preview */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-white/90 mb-4">Quelle est la dérivée de f(x) = 3x² + 2x - 1 ?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['f\'(x) = 6x + 2', 'f\'(x) = 3x + 2', 'f\'(x) = 6x', 'f\'(x) = 3x²'].map((option, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg text-sm transition-all ${
                          i === 0
                            ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 text-emerald-400'
                            : 'bg-white/5 text-white/70 border border-white/10'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-white/60 text-sm">Question 3/10</div>
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[30%] h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />
                    </div>
                  </div>
                  <div className="text-amber-400 font-bold">75% Score</div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-white" />
                  <span className="text-white font-bold">+500 Points</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold text-sm">Recommandation</div>
                    <div className="text-gray-500 text-xs">Cours suggéré: Algèbre</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Étudiants Actifs' },
              { value: '50,000+', label: 'Quiz Complétés' },
              { value: '95%', label: 'Taux de Réussite' },
              { value: '4.9/5', label: 'Satisfaction' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
