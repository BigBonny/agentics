import OpenAI from 'openai'
import { AIRecommendation } from '@/lib/types/course'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class RecommendationEngine {
  async generatePersonalizedRecommendations(
    userId: string,
    userProgress: any,
    quizHistory: any[],
    courseEnrollments: any[],
    availableCourses: any[]
  ): Promise<AIRecommendation[]> {
    try {
      const prompt = `
        En tant qu'agent de recommandation pédagogique, analysez le profil de l'étudiant et générez des recommandations personnalisées:

        Profil de l'étudiant:
        - ID: ${userId}
        - Progression: ${JSON.stringify(userProgress, null, 2)}
        - Historique des quiz: ${JSON.stringify(quizHistory, null, 2)}
        - Cours inscrits: ${JSON.stringify(courseEnrollments, null, 2)}

        Cours disponibles: ${JSON.stringify(availableCourses, null, 2)}

        Générez 5-8 recommandations personnalisées incluant:
        1. Cours recommandés basés sur les faiblesses
        2. Exercices de renforcement
        3. Contenu complémentaire
        4. Quiz de pratique
        5. Parcours d'apprentissage suggéré

        Pour chaque recommandation, fournissez:
        - Type (course, exercise, content, quiz)
        - ID de l'élément
        - Titre descriptif
        - Description détaillée
        - Raison de la recommandation
        - Score de confiance (0-100)
        - Priorité (high, medium, low)

        Priorité:
        - High: Faiblesses critiques, blocages d'apprentissage
        - Medium: Améliorations nécessaires, prochaines étapes logiques
        - Low: Enrichissement, exploration, approfondissement

        Répondez en format JSON avec une liste de recommandations.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en recommandations pédagogiques qui analyse les profils d'apprentissage pour proposer des parcours optimisés."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
      })

      const response = completion.choices[0].message.content
      return JSON.parse(response || '[]')
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  async analyzeLearningPatterns(
    userId: string,
    studySessions: any[],
    quizAttempts: any[],
    courseProgress: any[]
  ): Promise<{
    strengths: string[]
    weaknesses: string[]
    learningStyle: string
    optimalStudyTime: string
    preferredDifficulty: number
    conceptualGaps: string[]
    recommendations: string[]
  }> {
    try {
      const prompt = `
        Analysez les patterns d'apprentissage de l'étudiant:

        Sessions d'étude: ${JSON.stringify(studySessions, null, 2)}
        Tentatives de quiz: ${JSON.stringify(quizAttempts, null, 2)}
        Progression des cours: ${JSON.stringify(courseProgress, null, 2)}

        Identifiez et analysez:
        1. Les forces académiques (sujets maîtrisés)
        2. Les faiblesses (sujets difficiles)
        3. Le style d'apprentissage dominant
        4. Les moments d'étude optimaux
        5. Le niveau de difficulté préféré
        6. Les lacunes conceptuelles critiques
        7. Recommandations d'optimisation

        Style d'apprentissage: visual, auditif, kinesthésique, lecture/écriture
        Moments optimaux: matin, après-midi, soir, nuit
        Niveau de difficulté: 1-10

        Répondez en format JSON structuré.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en analyse des patterns d'apprentissage qui identifie les tendances et optimise les parcours pédagogiques."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
      })

      const response = completion.choices[0].message.content
      return JSON.parse(response || '{}')
    } catch (error) {
      console.error('Error analyzing learning patterns:', error)
      throw error
    }
  }

  async generateLearningPath(
    userId: string,
    currentLevel: number,
    targetGoals: string[],
    timeAvailable: number, // hours per week
    currentKnowledge: any
  ): Promise<{
    path: Array<{
      step: number
      title: string
      description: string
      type: 'course' | 'quiz' | 'exercise' | 'review'
      duration: number // in hours
      prerequisites: string[]
      learningObjectives: string[]
      resources: string[]
    }>
    totalDuration: number
    estimatedCompletion: string
    milestones: string[]
  }> {
    try {
      const prompt = `
        Créez un parcours d'apprentissage personnalisé:

        Profil de l'étudiant:
        - Niveau actuel: ${currentLevel}/10
        - Objectifs: ${targetGoals.join(', ')}
        - Temps disponible: ${timeAvailable}h/semaine
        - Connaissances actuelles: ${JSON.stringify(currentKnowledge, null, 2)}

        Générez un parcours structuré avec:
        1. Étapes séquentielles et logiques
        2. Durée estimée par étape
        3. Prérequis clairs
        4. Objectifs d'apprentissage spécifiques
        5. Ressources recommandées
        6. Jalons importants

        Types d'étapes:
        - course: Cours théorique
        - quiz: Évaluation des connaissances
        - exercise: Pratique guidée
        - review: Révision et consolidation

        Le parcours doit être:
        - Réaliste et réalisable
        - Progressivement difficile
        - Aligné avec les objectifs
        - Adapté au temps disponible

        Répondez en format JSON structuré.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en planification pédagogique qui crée des parcours d'apprentissage réalistes et efficaces."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
      })

      const response = completion.choices[0].message.content
      return JSON.parse(response || '{}')
    } catch (error) {
      console.error('Error generating learning path:', error)
      throw error
    }
  }

  async predictSuccessProbability(
    userId: string,
    courseId: string,
    userProfile: any,
    courseContent: any
  ): Promise<{
    probability: number // 0-100
    factors: Array<{
      factor: string
      impact: number
      explanation: string
    }>
    recommendations: string[]
    adjustments: string[]
  }> {
    try {
      const prompt = `
        Évaluez la probabilité de succès de l'étudiant pour ce cours:

        Profil de l'étudiant: ${JSON.stringify(userProfile, null, 2)}
        Contenu du cours: ${JSON.stringify(courseContent, null, 2)}

        Analysez les facteurs de succès:
        1. Adéquation du niveau
        2. Prérequis maîtrisés
        3. Style d'apprentissage compatible
        4. Temps disponible suffisant
        5. Motivation et intérêt
        6. Historique de performance

        Fournissez:
        - Probabilité de succès (0-100%)
        - Facteurs d'influence avec impact
        - Recommandations pour augmenter les chances
        - Ajustements suggérés

        Répondez en format JSON structuré.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un analyste pédagogique qui évalue les probabilités de succès et fournit des recommandations optimisées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
      })

      const response = completion.choices[0].message.content
      return JSON.parse(response || '{}')
    } catch (error) {
      console.error('Error predicting success probability:', error)
      throw error
    }
  }
}
