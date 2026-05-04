'use client'

import { motion } from 'framer-motion'
import { Star, Quote, TrendingUp } from 'lucide-react'

const testimonials = [
  {
    name: 'Marie L.',
    role: 'Étudiante en Médecine',
    content: 'Grâce à cette plateforme, j\'ai augmenté ma moyenne de 15% en seulement 2 mois. Les quiz adaptatifs sont incroyables!',
    rating: 5,
    improvement: '+15%'
  },
  {
    name: 'Thomas B.',
    role: 'Étudiant en Ingénierie',
    content: 'Je recommande vivement l\'abonnement Premium. L\'analyse des faiblesses m\'a permis de cibler mes révisions efficacement.',
    rating: 5,
    improvement: '+22%'
  },
  {
    name: 'Sophie M.',
    role: 'Étudiante en Droit',
    content: 'La meilleure investment pour mes études. Le suivi de progression me motive chaque jour à m\'améliorer.',
    rating: 5,
    improvement: '+18%'
  }
]

const stats = [
  { value: '95%', label: 'Taux de Réussite', description: 'Amélioration moyenne' },
  { value: '10,000+', label: 'Étudiants Actifs', description: 'Dans toute la France' },
  { value: '50,000+', label: 'Quiz Complétés', description: 'Avec succès' },
  { value: '4.9/5', label: 'Note Moyenne', description: 'Sur 2,000 avis' }
]

export default function SocialProof() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-violet-50/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Ils ont transformé </span>
            <span className="gradient-text">leurs résultats</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez des milliers d'étudiants qui ont déjà amélioré leurs notes avec notre plateforme
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 p-8 bg-gradient-to-r from-violet-50 via-purple-50 to-violet-50 rounded-3xl"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-gray-900 font-semibold">{stat.label}</div>
              <div className="text-gray-500 text-sm">{stat.description}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card-premium p-8 h-full flex flex-col">
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Quote className="h-4 w-4 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 flex-grow leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold text-sm">{testimonial.improvement}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
