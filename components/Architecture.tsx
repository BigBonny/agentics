'use client'

import { Brain, Search, MessageSquare, Zap, Target, BookOpen, Sparkles } from 'lucide-react'

export default function Architecture() {
  const agents = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Agent Évaluateur",
      description: "Analyse vos réponses et identifie précisément vos lacunes conceptuelles",
      features: [
        "Détection des biais cognitifs",
        "Analyse des erreurs systématiques",
        "Évaluation adaptative du niveau",
        "Identification des prérequis manquants"
      ],
      color: "from-purple-500 to-purple-700"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Agent Curateur (RAG)",
      description: "Extrait le contenu pertinent et l'adapte à vos besoins spécifiques",
      features: [
        "Recherche vectorielle sémantique",
        "Filtrage par niveau de difficulté",
        "Mise à jour continue du contenu",
        "Alignement avec les programmes officiels"
      ],
      color: "from-blue-500 to-blue-700"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Agent Mentor",
      description: "Génère des explications personnalisées et des exercices de remédiation",
      features: [
        "Adaptation du style pédagogique",
        "Création d'analogies personnalisées",
        "Génération d'exercices progressifs",
        "Feedback constructif instantané"
      ],
      color: "from-green-500 to-green-700"
    }
  ]

  return (
    <section id="architecture" className="py-20 bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Notre <span className="gradient-text">Architecture</span> Agentics
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trois agents intelligents travaillent en synergie pour créer une expérience 
            d'apprentissage véritablement personnalisée et efficace.
          </p>
        </div>

        {/* Reasoning Graph */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full filter blur-3xl opacity-30"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              <Sparkles className="inline h-6 w-6 mr-2 text-primary-600" />
              Graphe de Raisonnement Intégré
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {agents.map((agent, index) => (
                <div key={index} className="relative">
                  <div className={`bg-gradient-to-br ${agent.color} rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
                    <div className="flex items-center mb-4">
                      <div className="bg-white/20 rounded-full p-3 mr-4">
                        {agent.icon}
                      </div>
                      <h4 className="text-xl font-bold">{agent.title}</h4>
                    </div>
                    <p className="text-white/90 mb-4">{agent.description}</p>
                    <ul className="space-y-2">
                      {agent.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Zap className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-yellow-300" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Connection lines */}
                  {index < agents.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Data flow visualization */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium">
                <Target className="h-4 w-4 mr-2" />
                Flux de données bidirectionnel • Analyse en temps réel • Adaptation continue
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-6 w-6" />,
              title: "Intelligence Collective",
              description: "Chaque agent apporte son expertise pour une compréhension complète de vos besoins"
            },
            {
              icon: <Zap className="h-6 w-6" />,
              title: "Apprentissage Adaptatif",
              description: "Le système évolue avec vous pour une pertinence croissante"
            },
            {
              icon: <BookOpen className="h-6 w-6" />,
              title: "Excellence Pédagogique",
              description: "Méthodes validées par des experts en éducation et cognitive science"
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 rounded-full p-3 mr-4 text-primary-600">
                  {benefit.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{benefit.title}</h4>
              </div>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
