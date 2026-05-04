'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, ArrowRight, Clock, Shield, Crown, Star, Zap, TrendingUp, Brain } from 'lucide-react'
import NewHeader from '../../components/NewHeader'
import NewFooter from '../../components/NewFooter'

const plans = [
  {
    id: 'free',
    name: 'Découverte',
    price: '0€',
    period: '/mois',
    description: 'Pour essayer la plateforme',
    features: [
      { text: '3 quizzes IA par mois', included: true },
      { text: 'Résultats de base', included: true },
      { text: 'Support email', included: true },
      { text: 'Analyse des faiblesses', included: false },
      { text: 'Quiz illimités', included: false },
      { text: 'Cours personnalisés', included: false },
      { text: 'Suivi de progression', included: false },
      { text: 'Support prioritaire', included: false }
    ],
    cta: 'Commencer Gratuitement',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: '19€',
    priceYearly: '190€',
    periodMonthly: '/mois',
    periodYearly: '/an',
    description: 'Pour les étudiants sérieux',
    features: [
      { text: 'Quizzes IA illimités', included: true },
      { text: 'Analyse complète des faiblesses', included: true },
      { text: 'Cours personnalisés adaptatifs', included: true },
      { text: 'Suivi de progression détaillé', included: true },
      { text: 'Exercices de remédiation ciblés', included: true },
      { text: 'Support prioritaire 24/7', included: true },
      { text: 'Certifications et badges', included: true },
      { text: 'Accès à vie aux cours', included: true }
    ],
    cta: 'Passer Premium',
    popular: true,
    badge: 'Plus Populaire',
    savings: 'Économisez 38€'
  }
]

const faqs = [
  {
    question: 'Puis-je changer de forfait à tout moment ?',
    answer: 'Oui, vous pouvez passer à Premium ou revenir au forfait gratuit à tout moment. Aucun engagement.'
  },
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer: 'Vous avez accès à toutes les fonctionnalités Premium pendant 30 jours. Si vous n\'êtes pas satisfait, vous pouvez annuler sans frais.'
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons les cartes de crédit, PayPal, et Apple Pay. Tous les paiements sont sécurisés par Stripe.'
  },
  {
    question: 'Y a-t-il des réductions pour les étudiants ?',
    answer: 'Oui ! Nous offrons 20% de réduction supplémentaire aux étudiants avec une carte étudiante valide.'
  }
]

export default function Pricing() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      router.push('/sign-up')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: planId,
          billingCycle
        })
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white">
      <NewHeader />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="text-violet-700 font-medium text-sm">30 jours d'essai gratuit</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gray-900">Choisissez votre </span>
              <span className="gradient-text">plan idéal</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Commencez gratuitement et passez à Premium quand vous êtes prêt à accélérer votre réussite.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-full shadow-lg p-1.5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annuel
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">-17%</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? 'ring-4 ring-violet-500/20 shadow-2xl scale-105 z-10'
                    : 'shadow-xl hover:shadow-2xl'
                } ${hoveredPlan === plan.id ? 'scale-[1.02]' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-bl-2xl font-semibold text-sm flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    {plan.badge}
                  </div>
                )}

                <div className="bg-white p-8 h-full flex flex-col">
                  {/* Plan Header */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-500">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.id === 'premium'
                          ? billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly
                          : plan.price}
                      </span>
                      <span className="text-gray-500 text-lg">
                        {plan.id === 'premium'
                          ? billingCycle === 'monthly' ? plan.periodMonthly : plan.periodYearly
                          : plan.period}
                      </span>
                    </div>
                    {plan.popular && billingCycle === 'yearly' && (
                      <p className="text-emerald-600 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {plan.savings}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg mb-8 transition-all duration-300 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'btn-premium'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span>Chargement...</span>
                    ) : (
                      <>
                        <span>{plan.cta}</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  {/* Features */}
                  <div className="space-y-4 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-gray-400 text-xs">-</span>
                          </div>
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-gray-600"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              <span>Paiement sécurisé par Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-500" />
              <span>Annulation à tout moment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>30 jours satisfait ou remboursé</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-gray-900">Questions </span>
              <span className="gradient-text">Fréquentes</span>
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir avant de vous lancer
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-violet-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à Transformer Vos Résultats ?
            </h2>
            <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 10,000 étudiants qui ont déjà amélioré leurs notes avec notre plateforme IA.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSubscribe('premium')}
              className="btn-gold inline-flex items-center gap-2 px-10 py-5 text-lg"
            >
              <Crown className="h-6 w-6" />
              <span>Commencer Mon Essai Gratuit</span>
              <ArrowRight className="h-6 w-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <NewFooter />
    </div>
  )
}
