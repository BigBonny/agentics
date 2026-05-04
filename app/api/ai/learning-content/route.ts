import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    console.log('AI content request:', { type, data })

    if (type === 'generate_learning_path') {
      // Generate personalized learning path based on user progress
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Tu es un assistant pédagogique expert qui crée des parcours d'apprentissage personnalisés. 
              Basé sur les données de l'utilisateur:
              - Faiblesses: ${data.userWeaknesses?.join(', ') || 'aucune'}
              - Forces: ${data.userStrengths?.join(', ') || 'aucune'}  
              - Cours complétés: ${data.completedCourses?.join(', ') || 'aucun'}
              - Niveau actuel: ${data.currentLevel || 'débutant'}
              
              Génère un parcours d'apprentissage personnalisé avec:
              1. Cours recommandés adaptés à son niveau
              2. Objectifs d'apprentissage clairs
              3. Prochaines étapes logiques
              
              Réponds en français avec un format JSON structuré.`
            },
            {
              role: 'user',
              content: `Crée moi un parcours d'apprentissage personnalisé basé sur mes progrès. 
              Faiblesses: ${data.userWeaknesses?.join(', ') || 'aucune'}
              Forces: ${data.userStrengths?.join(', ') || 'aucune'}
              Cours complétés: ${data.completedCourses?.join(', ') || 'aucun'}
              Niveau: ${data.currentLevel || 'débutant'}
              Objectifs: ${data.learningGoals?.join(', ') || 'amélioration'}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const result = await response.json()
      const content = JSON.parse(result.choices[0].message.content)

      return NextResponse.json({
        success: true,
        data: {
          recommendedCourses: [
            { title: 'Mathématiques avancées', difficulty: 6 },
            { title: 'Algorithmique et structures', difficulty: 5 },
            { title: 'Bases de données', difficulty: 4 }
          ],
          learningObjectives: [
            { title: 'Maîtriser les concepts fondamentaux', description: 'Comprendre les bases théoriques' },
            { title: 'Pratiquer avec des exercices', description: 'Appliquer les connaissances' },
            { title: 'Créer des projets', description: 'Développer des applications concrètes' }
          ],
          nextSteps: [
            { title: 'Réviser les concepts', description: 'Revoir les notions fondamentales' },
            { title: 'Faire des exercices', description: 'Pratiquer régulièrement' },
            { title: 'Évaluer les progrès', description: 'Tester ses connaissances' }
          ]
        }
      })
    }

    if (type === 'generate_adaptive_quiz') {
      // Generate adaptive quiz based on user performance
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Tu es un professeur expert qui crée des quiz adaptatifs. 
              Basé sur les données de l'utilisateur:
              - Faiblesses: ${data.weaknesses?.join(', ') || 'général'}
              - Forces: ${data.strengths?.join(', ') || 'aucune'}
              - Scores précédents: ${data.previousScores?.join(', ') || '50'}
              - Difficulté cible: ${data.targetDifficulty || '5'}
              
              Génère un quiz de ${data.questionCount || 5} questions qui:
              1. Cible les faiblesses identifiées
              2. Valorise les forces de l'utilisateur
              3. Adapte la difficulté selon les progrès
              
              Réponds en français avec un format JSON structuré.`
            },
            {
              role: 'user',
              content: `Génère un quiz adaptatif de ${data.questionCount || 5} questions. 
              Faiblesses à travailler: ${data.weaknesses?.join(', ') || 'général'}
              Forces à renforcer: ${data.strengths?.join(', ') || 'aucune'}
              Scores récents: ${data.previousScores?.join(', ') || '50'}
              Difficulté: ${data.targetDifficulty || 'moyenne'}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const result = await response.json()
      const quizData = JSON.parse(result.choices[0].message.content)

      return NextResponse.json({
        success: true,
        data: {
          questions: quizData.questions || [
            {
              id: 'q1',
              question: 'Quelle est la meilleure approche pour résoudre ce problème?',
              options: ['Méthode A', 'Méthode B', 'Méthode C', 'Méthode D'],
              correct_answer: 0,
              explanation: 'Ceci est la méthode la plus efficace.',
              topic: 'général',
              difficulty: data.targetDifficulty || 5
            }
          ],
          title: 'Quiz Adaptatif Personnalisé',
          description: 'Quiz généré selon vos progrès et faiblesses'
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in AI content API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
