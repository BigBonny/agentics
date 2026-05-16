'use client'

import { motion } from 'framer-motion'
import { Sparkles, Target, Zap, Shield } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Quiz IA Adaptatifs',
    description: 'Des questions qui s\'ajustent à votre niveau en temps réel'
  },
  {
    icon: Target,
    title: 'Analyse des Faiblesses',
    description: 'Identifiez vos points faibles et concentrez-vous sur l\'essentiel'
  },
  {
    icon: Zap,
    title: 'Progression Rapide',
    description: 'Suivez votre évolution et atteignez vos objectifs plus vite'
  },
  {
    icon: Shield,
    title: 'Contenu Vérifié',
    description: 'Des cours et quiz préparés par des experts en pédagogie'
  }
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
            <span className="text-gray-900">Une approche </span>
            <span className="gradient-text">intelligente</span>
            <span className="text-gray-900"> de la révision</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre plateforme utilise l'IA pour créer un parcours d'apprentissage sur mesure, adapté à vos besoins spécifiques
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card-premium p-8 h-full flex flex-col text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
