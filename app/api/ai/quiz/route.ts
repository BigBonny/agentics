import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { QuizGenerator } from '@/lib/quiz-generator'
import { RecommendationEngine } from '@/lib/recommendation-engine'
import Groq from 'groq-sdk'

const quizGenerator = new QuizGenerator()
const recommendationEngine = new RecommendationEngine()

// Initialize Groq
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

export async function POST(request: NextRequest) {
  try {
    // Temporarily remove authentication for testing
    // const user = await getCurrentUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    // Mock user for testing
    const user = { id: 'test-user-id' }

    const requestBody = await request.json()
    console.log('Raw request body:', requestBody)
    
    const { type, ...data } = requestBody
    console.log('Parsed request:', { type, data })

    switch (type) {
      case 'generateCourseQuiz':
        return await handleGenerateCourseQuiz(data, user.id)
      
      case 'evaluateQuiz':
        return await handleEvaluateQuiz(data, user.id)
      
      case 'generate_quiz':
        return await handleGenerateQuiz(data, user.id)
      
      case 'generate_adaptive_quiz':
        return await handleGenerateAdaptiveQuiz(data, user.id)
      
      case 'generate_exercises':
        return await handleGenerateExercises(data, user.id)
      
      case 'evaluate_answers':
        return await handleEvaluateAnswers(data, user.id)
      
      case 'get_recommendations':
        return await handleGetRecommendations(data, user.id)
      
      case 'analyze_patterns':
        return await handleAnalyzePatterns(data, user.id)
      
      case 'generate_learning_path':
        return await handleGenerateLearningPath(data, user.id)
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleGenerateQuiz(data: any, userId: string) {
  const { courseId, questionCount } = data

  // Get course details
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Get course content
  const { data: content } = await supabaseAdmin
    .from('course_content')
    .select('content')
    .eq('course_id', courseId)
    .order('order_index')

  const contentText = content?.map(c => c.content) || []

  const quiz = await quizGenerator.generateQuizFromCourse(
    course.title,
    contentText,
    course.topics,
    course.difficulty,
    questionCount || 10
  )

  return NextResponse.json(quiz)
}

async function handleGenerateAdaptiveQuiz(data: any, userId: string) {
  try {
    console.log('Generating adaptive quiz with data:', data)
    
    const { weaknesses, strengths, previousScores, targetDifficulty, questionCount } = data

    console.log('Calling quizGenerator.generateAdaptiveQuiz...')
    const quiz = await quizGenerator.generateAdaptiveQuiz(
      weaknesses || [],
      strengths || [],
      previousScores || [],
      targetDifficulty || 5,
      questionCount || 5
    )

    console.log('Quiz generated successfully:', quiz)
    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error in handleGenerateAdaptiveQuiz:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du quiz', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}

async function handleGenerateExercises(data: any, userId: string) {
  const { topic, difficulty, exerciseTypes, count } = data

  const exercises = await quizGenerator.generatePracticeExercises(
    topic,
    difficulty || 5,
    exerciseTypes || ['problem_solving', 'application'],
    count || 5
  )

  return NextResponse.json(exercises)
}

async function handleEvaluateAnswers(data: any, userId: string) {
  const { questions, userAnswers } = data

  const evaluation = await quizGenerator.evaluateQuizAnswers(
    questions,
    userAnswers
  )

  return NextResponse.json(evaluation)
}

async function handleGetRecommendations(data: any, userId: string) {
  // Get user's progress data
  const { data: userProgress } = await supabaseAdmin
    .from('progress')
    .select('*')
    .eq('user_id', userId)

  const { data: quizHistory } = await supabaseAdmin
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(10)

  const { data: courseEnrollments } = await supabaseAdmin
    .from('course_enrollments')
    .select('*, courses(*)')
    .eq('user_id', userId)

  const { data: availableCourses } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('is_published', true)

  const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
    userId,
    userProgress || [],
    quizHistory || [],
    courseEnrollments || [],
    availableCourses || []
  )

  return NextResponse.json(recommendations)
}

async function handleAnalyzePatterns(data: any, userId: string) {
  const { data: studySessions } = await supabaseAdmin
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: quizAttempts } = await supabaseAdmin
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(20)

  const { data: courseProgress } = await supabaseAdmin
    .from('course_progress')
    .select('*, courses(*)')
    .eq('user_id', userId)

  const analysis = await recommendationEngine.analyzeLearningPatterns(
    userId,
    studySessions || [],
    quizAttempts || [],
    courseProgress || []
  )

  return NextResponse.json(analysis)
}

async function handleGenerateLearningPath(data: any, userId: string) {
  const { currentLevel, targetGoals, timeAvailable } = data

  // Get current knowledge from user progress
  const { data: currentKnowledge } = await supabaseAdmin
    .from('progress')
    .select('*')
    .eq('user_id', userId)

  const learningPath = await recommendationEngine.generateLearningPath(
    userId,
    currentLevel || 5,
    targetGoals || [],
    timeAvailable || 10,
    currentKnowledge
  )

  return NextResponse.json(learningPath)
}

async function handleGenerateCourseQuiz(data: any, userId: string) {
  try {
    console.log('Generating course quiz with data:', data)
    
    const { courseId, questionCount, timeLimit } = data

    // Fetch course details
    console.log('Fetching course with ID:', courseId)
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    console.log('Course fetch result:', { course, courseError })

    if (courseError || !course) {
      console.error('Course not found or error:', courseError)
      throw new Error(`Course not found: ${courseError?.message || 'Unknown error'}`)
    }

    console.log('Found course:', course.title)
    console.log('Course has ai_extracted_content:', !!course.ai_extracted_content)
    console.log('ai_extracted_content length:', course.ai_extracted_content?.length || 0)

    // Use extracted PDF content if available, otherwise use course metadata
    const courseContent = course.ai_extracted_content || course.description || ''
    
    console.log('Using course content for quiz generation:', courseContent ? 'Yes' : 'No')
    console.log('Content preview:', courseContent.substring(0, 200) + '...')

    const prompt = `
      Générez un quiz pour le cours suivant basé sur le contenu réel du cours:
      
      Titre: ${course.title}
      Description: ${course.description}
      Matière: ${course.subject}
      Niveau: ${course.level}
      Difficulté: ${course.difficulty}/10
      Objectifs d'apprentissage: ${course.learning_objectives?.join(', ') || 'N/A'}
      Sujets abordés: ${course.topics?.join(', ') || 'N/A'}
      
      ${courseContent ? `CONTENU DU COURS À UTILISER POUR LES QUESTIONS:\n${courseContent}\n\n` : ''}
      
      Instructions:
      1. Générez EXACTEMENT ${questionCount} questions à choix multiples (pas plus, pas moins)
      2. Chaque question doit avoir 4 options (A, B, C, D)
      3. Indiquez la réponse correcte (0-3)
      4. Fournissez une explication détaillée
      5. Adaptez la difficulté au niveau ${course.level}
      6. ${courseContent ? 'BASEZ LES QUESTIONS SUR LE CONTENU DU COURS FOURNI CI-DESSUS. Les questions doivent être spécifiques au contenu du PDF.' : 'Concentrez-vous sur les objectifs d\'apprentissage et les sujets abordés'}
      
      IMPORTANT: Vous devez générer EXACTEMENT ${questionCount} questions, ni plus ni moins.
      
      Répondez en format JSON structuré comme suit:
      {
        "questions": [
          {
            "id": "q1",
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "explanation": "Detailed explanation here",
            "topic": "Related topic",
            "difficulty": ${course.difficulty}
          }
        ]
      }
    `

    console.log('Making Groq API call for course quiz...')
    
    // Check if Groq API key is available
    if (!groq) {
      console.error('Groq API key not found - using content-based fallback')
      // Generate questions from course content using simple extraction
      const mockQuestions: any[] = []
      
      // Split content into sentences to generate questions
      const sentences = courseContent.split('.').filter(s => s.trim().length > 10)
      const numQuestions = Math.min(sentences.length, questionCount)
      
      for (let i = 0; i < numQuestions; i++) {
        mockQuestions.push({
          id: `q${i + 1}`,
          question: `Question ${i + 1}: Basée sur le contenu du cours: ${sentences[i].trim()}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct_answer: 0,
          explanation: `Cette question est basée sur: ${sentences[i].trim()}`,
          topic: course.subject,
          difficulty: course.difficulty
        })
      }
      
      console.log(`Generated ${mockQuestions.length} questions from course content`)
      return NextResponse.json({ questions: mockQuestions })
    }
    
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
      
      const text = chatCompletion.choices[0]?.message?.content || '{}'
      
      console.log('Groq API call successful')
      console.log('Groq response:', text)
      
      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text || '{}')
      console.log('Parsed response:', parsedResponse)
      
      return NextResponse.json(parsedResponse)
    } catch (groqError) {
      console.error('Groq API call failed:', groqError)
      // Generate questions from course content using simple extraction
      const mockQuestions: any[] = []
      
      // Split content into sentences to generate questions
      const sentences = courseContent.split(/[.!?]+/).filter(s => s.trim().length > 20)
      
      for (let i = 0; i < questionCount; i++) {
        const sentenceIndex = i % sentences.length
        const sentence = sentences[sentenceIndex]?.trim() || `Concept ${i + 1} du cours`
        
        mockQuestions.push({
          id: `q${i + 1}`,
          question: `Selon le cours "${course.title}", ${sentence.substring(0, 150)}${sentence.length > 150 ? '...' : ''}`,
          options: [
            sentence.substring(0, 50) || "Vrai",
            "Faux",
            "Partiellement vrai",
            "Non applicable"
          ],
          correct_answer: 0,
          explanation: `Basé sur le contenu extrait du PDF: ${sentence.substring(0, 100)}...`,
          topic: course.subject,
          difficulty: course.difficulty
        })
      }
      
      console.log(`Generated ${mockQuestions.length} questions from course content (fallback)`)
      return NextResponse.json({ questions: mockQuestions })
    }
  } catch (error) {
    console.error('Error in handleGenerateCourseQuiz:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du quiz', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}

async function handleEvaluateQuiz(data: any, userId: string) {
  try {
    console.log('Evaluating quiz with data:', data)
    
    const { courseId, questions, userAnswers, timeTaken } = data

    // Calculate results
    let correctAnswers = 0
    let incorrectAnswers = 0
    const weaknesses: string[] = []
    const strengths: string[] = []
    const topicPerformance: Record<string, { correct: number; total: number }> = {}

    questions.forEach((question: any, index: number) => {
      const isCorrect = userAnswers[index] === question.correct_answer
      
      if (isCorrect) {
        correctAnswers++
        strengths.push(question.topic)
      } else {
        incorrectAnswers++
        weaknesses.push(question.topic)
      }

      // Track performance by topic
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 }
      }
      topicPerformance[question.topic].total++
      if (isCorrect) {
        topicPerformance[question.topic].correct++
      }
    })

    const totalQuestions = questions.length
    const score = correctAnswers
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)

    // Generate feedback based on performance
    let feedback = ''
    if (percentage >= 80) {
      feedback = 'Excellent travail ! Vous avez maîtrisé la plupart des concepts de ce cours. Continuez comme ça !'
    } else if (percentage >= 60) {
      feedback = 'Bon travail ! Vous avez une compréhension solide mais certains concepts méritent d\'être revus.'
    } else {
      feedback = 'Vous avez besoin de plus de pratique sur ce cours. Concentrez-vous sur les sujets où vous avez rencontré des difficultés.'
    }

    // Get course details for recommendations
    const { data: currentCourse } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    // Find recommended courses based on weaknesses
    const recommendedCourses: string[] = []
    const recommendedQuizzes: string[] = []

    if (weaknesses.length > 0) {
      // Find courses that address the weaknesses
      const { data: relatedCourses } = await supabaseAdmin
        .from('courses')
        .select('*')
        .neq('id', courseId)
        .limit(3)

      if (relatedCourses) {
        relatedCourses.forEach((course: any) => {
          const courseTopics = course.topics || []
          const hasRelevantTopic = weaknesses.some(weakness => 
            courseTopics.some((topic: string) => 
              topic.toLowerCase().includes(weakness.toLowerCase())
            )
          )
          
          if (hasRelevantTopic && recommendedCourses.length < 3) {
            recommendedCourses.push(course.title)
          }
        })
      }

      // Generate quiz recommendations
      weaknesses.slice(0, 2).forEach((weakness, index) => {
        recommendedQuizzes.push(`Quiz de renforcement: ${weakness}`)
      })
    }

    const result = {
      score,
      total_questions: totalQuestions,
      percentage,
      time_taken: timeTaken,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      weaknesses: Array.from(new Set(weaknesses)),
      strengths: Array.from(new Set(strengths)),
      recommended_courses: recommendedCourses,
      recommended_quizzes: recommendedQuizzes,
      feedback
    }

    console.log('Quiz evaluation result:', result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in handleEvaluateQuiz:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'évaluation du quiz', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
