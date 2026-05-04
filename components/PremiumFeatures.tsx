'use client'

import { motion } from 'framer-motion'
import { Sparkles, Brain, Target, TrendingUp, Zap, Shield, Crown, Clock, Award, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

const features = [
  {
    icon: Brain,
    title: 'Quiz IA Adaptatifs',
    description: 'Des questions qui s\'adaptent à votre niveau en temps réel pour un apprentissage optimisé.',
    color: 'from-violet-500 to-purple-500',
    premium: false
  },
  {
    icon: Target,
    title: 'Analyse des Faiblesses',
    description: 'Identifiez automatiquement vos points faibles et recevez des exercices ciblés pour les renforcer.',
    color: 'from-pink-500 to-rose-500',
    premium: true
  },
  {
    icon: TrendingUp,
    title: 'Suivi de Progression',
    description: 'Visualisez votre évolution avec des graphiques détaillés et des statistiques personnalisées.',
    color: 'from-cyan-500 to-blue-500',
    premium: true
  },
  {
    icon: Zap,
    title: 'Résultats Instantanés',
    description: 'Obtenez vos scores et recommandations immédiatement après chaque quiz.',
    color: 'from-amber-500 to-yellow-500',
    premium: false
  },
  {
    icon: BookOpen,
    title: 'Bibliothèque Complète',
    description: 'Accédez à des milliers de questions couvrant tous les sujets du programme.',
    color: 'from-emerald-500 to-teal-500',
    premium: true
  },
  {
    icon: Award,
    title: 'Certifications',
    description: 'Gagnez des badges et certificats pour valoriser vos compétences auprès des employeurs.',
    color: 'from-orange-500 to-red-500',
    premium: true
  }
]

export default function PremiumFeatures() {
  const router = useRouter()

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-violet-50/30 to-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-violet-700 font-medium text-sm">Fonctionnalités Premium</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Tout ce dont vous avez </span>
            <span className="gradient-text">besoin pour réussir</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une suite complète d'outils alimentés par l'IA pour maximiser vos chances de succès aux examens
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card-premium h-full p-8 relative overflow-hidden">
                {/* Premium Badge */}
                {feature.premium && (
                  <div className="absolute top-4 right-4">
                    <span className="badge-premium">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à débloquer tout le potentiel ?
            </h3>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 10,000 étudiants qui utilisent déjà nos fonctionnalités premium pour exceller dans leurs études.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/pricing')}
              className="btn-gold inline-flex items-center gap-2 px-8 py-4"
            >
              <Crown className="h-5 w-5" />
              <span>Passer à Premium</span>
              <Sparkles className="h-5 w-5" />
            </motion.button>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-6 mt-8 text-white/70">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">30 jours satisfait ou remboursé</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
