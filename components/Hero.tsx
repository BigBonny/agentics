'use client'

import { useState } from 'react'
import { ArrowRight, Play, CheckCircle, TrendingUp, Users, Brain, Sparkles, FileText } from 'lucide-react'
import AuthButtons from './AuthButtons'
import { useUser } from '@clerk/nextjs'

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { isSignedIn } = useUser()

  const handleTakeQuiz = () => {
    // Navigate to quiz page or open quiz modal
    window.location.href = '/quiz/guest'
  }

  return (
    <section id="home" className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center animate-slide-up pt-8 md:pt-12 lg:pt-16">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-8 animate-pulse-slow">
            <Sparkles className="h-4 w-4 mr-2" />
            IA Adaptative • Résultats Prouvés • 95% de Satisfaction
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 text-shadow-lg">
            Surmontez Vos
            <span className="gradient-text"> Lacunes</span>
            <br />
            Académiques avec l'IA
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Notre plateforme d'apprentissage personnalisé utilise trois agents intelligents 
            pour analyser vos faiblesses, créer du contenu adapté et vous guider vers 
            la réussite de vos examens nationaux.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <AuthButtons />
            {!isSignedIn && (
              <button
                onClick={handleTakeQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FileText className="h-5 w-5" />
                Passer un Quiz
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Video demo button */}
          <div className="flex justify-center mb-16">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="group inline-flex items-center gap-3 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                {isPlaying ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-1" />
                )}
              </div>
              <span>Voir la démo de 2 minutes</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: <Users className="h-6 w-6" />, value: "10,000+", label: "Étudiants Actifs" },
              { icon: <TrendingUp className="h-6 w-6" />, value: "85%", label: "Amélioration des Notes" },
              { icon: <Brain className="h-6 w-6" />, value: "3", label: "Agents IA Spécialisés" },
              { icon: <CheckCircle className="h-6 w-6" />, value: "95%", label: "Taux de Satisfaction" }
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 text-primary-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem/Solution section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
          <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Le Problème que Nous Résolvons
            </h2>
            <div className="space-y-4">
              {[
                "Programmes de cours non adaptés à votre niveau",
                "Perte de temps sur des concepts déjà maîtrisés",
                "Lacunes conceptuelles jamais identifiées",
                "Méthodes d'apprentissage inefficaces"
              ].map((problem, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <p className="text-gray-600">{problem}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Notre Solution Intelligente
            </h2>
            <div className="space-y-4">
              {[
                "Analyse précise de vos connaissances et lacunes",
                "Contenu personnalisé adapté à votre rythme",
                "Feedback instantané et exercices de remédiation",
                "Suivi des progrès en temps réel"
              ].map((solution, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-600">{solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
