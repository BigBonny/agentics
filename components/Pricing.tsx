'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Check, Star, Users, School } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'
import { Button } from './ui/Button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Pricing() {
  const { isSignedIn } = useUser()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (tier: 'individual' | 'center') => {
    if (!isSignedIn) {
      toast.error('Veuillez vous connecter pour vous abonner')
      return
    }

    setLoading(tier)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: tier === 'individual' 
            ? 'price_1Oxxxxx' // Replace with actual price ID
            : 'price_1Oyyyyy', // Replace with actual price ID
          tier
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        toast.error('Erreur lors de la création de la session de paiement')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: "Étudiant Individuel",
      price: "12€",
      period: "/ mois",
      yearlyPrice: "100€",
      yearlyPeriod: "/ an",
      icon: <Users className="h-8 w-8" />,
      features: [
        "Accès illimité à la plateforme",
        "Évaluations personnalisées",
        "Suivi des progrès en temps réel",
        "Exercices de remédiation adaptés",
        "Support par agents intelligents",
        "Examens blancs simulés",
        "Accès à 50+ matières"
      ],
      highlighted: false,
      target: "Parfait pour les étudiants préparant leurs examens nationaux",
      tier: 'individual' as const
    },
    {
      name: "Centres de Formation",
      price: "Sur mesure",
      period: "",
      yearlyPrice: "20-30%",
      yearlyPeriod: "de réduction",
      icon: <School className="h-8 w-8" />,
      features: [
        "Gestion multi-apprenants",
        "Tableau de bord administratif",
        "Suivi collectif des progrès",
        "Rapports détaillés par classe",
        "Intégration avec vos systèmes",
        "Formation des enseignants",
        "Support prioritaire 24/7",
        "API personnalisée"
      ],
      highlighted: true,
      target: "Solution idéale pour les établissements d'enseignement",
      tier: 'center' as const
    }
  ]

  const additionalInfo = [
    "Aucun engagement requis",
    "Annulation à tout moment",
    "Essai gratuit de 14 jours",
    "Mise à jour continue du contenu"
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tarifs <span className="gradient-text">Accessibles</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des tarifs compétitifs adaptés à vos besoins, que vous soyez un étudiant 
            individuel ou un centre de formation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-8 ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-primary-600 to-blue-600 text-white shadow-2xl scale-105' 
                  : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl'
              } transition-all duration-200`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Plus Populaire
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                  plan.highlighted ? 'bg-white/20' : 'bg-primary-100 text-primary-600'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-lg ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>{plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <div className={`text-sm ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
                    <span className="font-semibold">{plan.yearlyPrice}</span>
                    <span>{plan.yearlyPeriod}</span>
                    {plan.yearlyPeriod.includes("réduction") && (
                      <div className="text-xs mt-1">pour les abonnements annuels</div>
                    )}
                  </div>
                )}
                <p className={`text-sm mt-4 ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
                  {plan.target}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${
                      plan.highlighted ? 'text-green-300' : 'text-primary-600'
                    }`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={loading === plan.tier}
                className={`w-full ${
                  plan.highlighted 
                    ? 'bg-white text-primary-600 hover:bg-primary-50' 
                    : ''
                }`}
                variant={plan.highlighted ? 'secondary' : 'primary'}
              >
                {loading === plan.tier ? 'Chargement...' : plan.name.includes("Centre") ? "Nous contacter" : "S'abonner"}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Pourquoi choisir Agentics Révision ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalInfo.map((info, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 rounded-full p-2 w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium">{info}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-primary-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Investissement dans Votre Réussite
            </h4>
            <p className="text-gray-700 mb-6">
              Notre plateforme représente un investissement minime comparé aux coûts des cours 
              particuliers traditionnels, tout en offrant une efficacité supérieure grâce à 
              notre technologie d'IA adaptative.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-semibold text-primary-600 mb-2">Coûts réduits</h5>
                <p className="text-sm text-gray-600">
                  Jusqu'à 70% moins cher que les cours particuliers traditionnels
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-semibold text-primary-600 mb-2">Efficacité prouvée</h5>
                <p className="text-sm text-gray-600">
                  Résultats 2x meilleurs grâce à l'apprentissage personnalisé
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-semibold text-primary-600 mb-2">Flexibilité totale</h5>
                <p className="text-sm text-gray-600">
                  Apprenez où vous voulez, quand vous voulez, à votre rythme
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
