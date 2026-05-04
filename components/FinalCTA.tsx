'use client'

import { motion } from 'framer-motion'
import { Crown, Sparkles, ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FinalCTA() {
  const router = useRouter()

  return (
    <section className="py-24 bg-gradient-to-b from-white to-violet-50/50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8"
            >
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="text-white font-semibold">Offre Spéciale - 30 Jours Gratuits</span>
            </motion.div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Commencez Votre <br />
              <span className="text-amber-300">Transformation Aujourd'hui</span>
            </h2>

            {/* Description */}
            <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 10,000 étudiants qui ont déjà amélioré leurs résultats. 
              Essayez gratuitement pendant 30 jours, sans engagement.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/pricing')}
                className="btn-gold inline-flex items-center justify-center gap-2 px-10 py-5 text-lg"
              >
                <Sparkles className="h-6 w-6" />
                <span>Essai Gratuit de 30 Jours</span>
                <ArrowRight className="h-6 w-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/quiz/guest')}
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300 text-lg"
              >
                <span>Faire un Quiz Gratuit</span>
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Paiement Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Annulation à Tout Moment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Satisfait ou Remboursé</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
