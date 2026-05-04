import { CheckCircle, BookOpen, TrendingUp, Clock, Users, Award } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Contenu Adaptatif",
      description: "Notre IA analyse votre niveau et adapte le contenu en fonction de vos progrès et de vos difficultés spécifiques."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Suivi de Progrès",
      description: "Visualisez votre évolution en temps réel avec des statistiques détaillées et des recommandations personnalisées."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Apprentissage Flexible",
      description: "Étudiez à votre rythme, 24/7, avec un accès illimité à tous les ressources et exercices."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Support Personnalisé",
      description: "Bénéficiez d'un accompagnement individualisé grâce à nos agents intelligents qui répondent à vos questions."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Examen Blanc",
      description: "Préparez-vous avec des examens blancs simulés qui reproduisent les conditions réelles des examens nationaux."
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Validation des Acquis",
      description: "Testez vos connaissances régulièrement et validez vos acquis avant de passer aux concepts suivants."
    }
  ]

  const benefits = [
    "Amélioration moyenne de 35% des notes",
    "Réduction de 50% du temps de révision",
    "Taux de réussite de 95% aux examens nationaux",
    "Accès à plus de 50 matières et spécialités"
  ]

  return (
    <section id="features" className="py-20 bg-white pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fonctionnalités <span className="gradient-text">Avancées</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez toutes les fonctionnalités qui font d'Agentics Révision la plateforme 
            idéale pour votre réussite académique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="bg-primary-100 rounded-full p-3 w-16 h-16 flex items-center justify-center text-primary-600 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Résultats Prouvés</h3>
              <p className="text-primary-100 mb-6">
                Nos utilisateurs témoignent d'améliorations significatives dans leurs résultats 
                académiques grâce à notre approche personnalisée.
              </p>
              <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Voir les témoignages
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                    <span className="font-semibold">{benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Pour Qui est Conçue Agentics Révision ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center text-blue-600 mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Étudiants Individuels</h4>
              <p className="text-gray-600">
                Parfait pour les étudiants préparant leurs examens nationaux 
                et souhaitant un accompagnement personnalisé.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center text-green-600 mx-auto mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Centres de Formation</h4>
              <p className="text-gray-600">
                Solution idéale pour les centres souhaitant offrir à leurs apprenants 
                un outil de révision moderne et efficace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
