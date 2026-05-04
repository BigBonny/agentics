import OpenAI from 'openai'
import { GeneratedQuiz, GeneratedQuestion } from '@/lib/types/course'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class QuizGenerator {
  async generateQuizFromCourse(
    courseTitle: string,
    courseContent: string[],
    topics: string[],
    difficulty: number,
    questionCount: number = 10
  ): Promise<GeneratedQuiz> {
    try {
      const prompt = `
        En tant qu'expert pédagogique, générez un quiz complet pour le cours suivant:

        Titre du cours: ${courseTitle}
        Contenu du cours: ${courseContent.join('\n\n')}
        Sujets couverts: ${topics.join(', ')}
        Niveau de difficulté: ${difficulty}/10
        Nombre de questions: ${questionCount}

        Générez:
        1. Un titre approprié pour le quiz
        2. Une description brève
        3. Un temps limite en minutes (15-60 minutes selon le nombre de questions)
        4. Un score de passage (70-80%)
        5. ${questionCount} questions variées avec:
           - Questions à choix multiples (40%)
           - Questions vrai/faux (20%)
           - Questions à réponse courte (40%)

        Pour chaque question, fournissez:
        - Le texte de la question
        - Le type de question
        - Les options (pour QCM)
        - La réponse correcte
        - Une explication détaillée
        - Le nombre de points (1-3 selon la difficulté)
        - La difficulté spécifique (1-10)
        - Le sujet spécifique

        Répondez en format JSON structuré.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en création de quiz pédagogiques qui génère des évaluations pertinentes et équilibrées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      })

      const response = completion.choices[0].message.content
      const quizData = JSON.parse(response || '{}')

      return {
        title: quizData.title || `Quiz: ${courseTitle}`,
        description: quizData.description || `Évaluation des connaissances sur ${courseTitle}`,
        time_limit_minutes: quizData.time_limit_minutes || 30,
        passing_score: quizData.passing_score || 75,
        questions: quizData.questions || []
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      throw error
    }
  }

  async generateAdaptiveQuiz(
    userWeaknesses: string[],
    userStrengths: string[],
    previousScores: number[],
    targetDifficulty: number,
    questionCount: number = 5
  ): Promise<GeneratedQuiz> {
    try {
      console.log('Starting generateAdaptiveQuiz with:', {
        userWeaknesses,
        userStrengths,
        previousScores,
        targetDifficulty,
        questionCount
      })

      const prompt = `
        Générez un quiz adaptatif basé sur le profil de l'étudiant:

        Faiblesses identifiées: ${userWeaknesses.join(', ')}
        Forces: ${userStrengths.join(', ')}
        Scores précédents: ${previousScores.join(', ')}
        Difficulté cible: ${targetDifficulty}/10
        Nombre de questions: ${questionCount}

        Instructions:
        1. Concentrez-vous 70% des questions sur les faiblesses
        2. Incluez 30% de questions sur les forces pour maintenir la confiance
        3. Ajustez la difficulté basée sur les scores précédents
        4. Créez des questions qui ciblent spécifiquement les lacunes conceptuelles

        Générez un quiz avec:
        - Titre adaptatif
        - Description personnalisée
        - Temps limite approprié
        - Score de passage (ajusté selon le niveau)
        - Questions variées et adaptatives

        Répondez en format JSON structuré.
      `

      console.log('Making OpenAI API call...')
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en pédagogie adaptative qui crée des évaluations personnalisées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
      })

      console.log('OpenAI API call successful')
      const response = completion.choices[0].message.content
      console.log('OpenAI response:', response)
      
      const parsedResponse = JSON.parse(response || '{}')
      console.log('Parsed response:', parsedResponse)
      
      return parsedResponse
    } catch (error) {
      console.error('Error in generateAdaptiveQuiz:', error)
      throw error
    }
  }

  async generatePracticeExercises(
    topic: string,
    difficulty: number,
    exerciseTypes: string[] = ['problem_solving', 'application', 'analysis'],
    count: number = 5
  ): Promise<GeneratedQuestion[]> {
    try {
      const prompt = `
        Générez ${count} exercices de pratique pour:

        Sujet: ${topic}
        Difficulté: ${difficulty}/10
        Types d'exercices: ${exerciseTypes.join(', ')}

        Pour chaque exercice, fournissez:
        - Un problème clair et contextuel
        - Le type d'exercice
        - Des indices progressifs (3 niveaux)
        - La solution détaillée
        - Les étapes de résolution
        - Points bonus possibles

        Les exercices doivent être:
        - Pratiques et réalistes
        - Progressifs en difficulté
        - Liés à des applications réelles
        - Engageants et motivants

        Répondez en format JSON avec une liste d'exercices.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert en création d'exercices pédagogiques pratiques et pertinents."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      })

      const response = completion.choices[0].message.content
      return JSON.parse(response || '[]')
    } catch (error) {
      console.error('Error generating practice exercises:', error)
      throw error
    }
  }

  async evaluateQuizAnswers(
    questions: GeneratedQuestion[],
    userAnswers: Record<string, any>
  ): Promise<{
    score: number
    maxScore: number
    percentage: number
    feedback: Array<{
      questionId: string
      isCorrect: boolean
      userAnswer: any
      correctAnswer: string
      explanation: string
      points: number
      feedback: string
    }>
    recommendations: string[]
    nextSteps: string[]
  }> {
    try {
      const prompt = `
        Évaluez les réponses suivantes au quiz:

        Questions: ${JSON.stringify(questions, null, 2)}
        Réponses de l'utilisateur: ${JSON.stringify(userAnswers, null, 2)}

        Fournissez une évaluation détaillée avec:
        1. Le score total et le score maximum
        2. Le pourcentage de réussite
        3. Le feedback détaillé pour chaque question
        4. Des recommandations personnalisées
        5. Les prochaines étapes d'apprentissage

        Pour chaque feedback de question, incluez:
        - Si la réponse est correcte
        - La réponse de l'utilisateur
        - La réponse correcte
        - Une explication détaillée
        - Des points obtenus
        - Un feedback constructif

        Répondez en format JSON structuré.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un évaluateur pédagogique qui fournit des feedbacks détaillés et constructifs."
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
      console.error('Error evaluating quiz answers:', error)
      throw error
    }
  }
}
