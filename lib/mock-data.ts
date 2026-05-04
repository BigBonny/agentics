// Mock data for testing without external services

export const mockUser = {
  id: 'mock-user-id',
  clerkId: 'mock-clerk-id',
  email: 'test@agentics-revision.fr',
  firstName: 'Jean',
  lastName: 'Dupont',
  subscriptionTier: 'premium',
  subscriptionStatus: 'active'
}

export const mockProgress = [
  {
    id: '1',
    subject: 'Mathématiques',
    topic: 'Fonctions',
    masteryLevel: 75,
    lastAccessed: new Date().toISOString(),
    timeSpent: 120
  },
  {
    id: '2',
    subject: 'Physique',
    topic: 'Mécanique',
    masteryLevel: 60,
    lastAccessed: new Date().toISOString(),
    timeSpent: 90
  },
  {
    id: '3',
    subject: 'Chimie',
    topic: 'Équilibres',
    masteryLevel: 85,
    lastAccessed: new Date().toISOString(),
    timeSpent: 150
  }
]

export const mockEvaluations = [
  {
    id: '1',
    subject: 'Mathématiques',
    score: 85,
    maxScore: 100,
    feedback: {
      strengths: ['Bonne compréhension des concepts de base', 'Calculs corrects'],
      weaknesses: ['Peut améliorer la vitesse de résolution'],
      recommendations: ['Pratiquer plus d\'exercices de dérivées'],
      conceptualGaps: ['Applications pratiques'],
      cognitiveBiases: []
    },
    createdAt: new Date().toISOString()
  }
]

export const mockContent = [
  {
    id: '1',
    subject: 'Mathématiques',
    topic: 'Fonctions',
    title: 'Introduction aux fonctions',
    content: 'Une fonction est une relation entre ensembles qui associe chaque élément d\'un ensemble de départ à un unique élément d\'un ensemble d\'arrivée.',
    difficulty: 3,
    prerequisites: ['Ensembles', 'Relations'],
    learningObjectives: ['Comprendre la notion de fonction', 'Identifier le domaine et le codomaine'],
    examples: ['f(x) = 2x + 1', 'g(x) = x²'],
    exercises: ['Trouver le domaine de f(x) = 1/(x-2)', 'Calculer f(3) pour f(x) = 2x + 1']
  }
]

export const mockEvaluationResult = {
  score: 85,
  maxScore: 100,
  feedback: {
    strengths: ['Bonne compréhension des concepts de base', 'Calculs corrects'],
    weaknesses: ['Peut améliorer la vitesse de résolution'],
    recommendations: ['Pratiquer plus d\'exercices de dérivées'],
    conceptualGaps: ['Applications pratiques'],
    cognitiveBiases: []
  },
  nextSteps: ['Réviser les applications pratiques', 'Faire des exercices de vitesse']
}

export const mockPersonalizedContent = [
  {
    topic: "Fonctions mathématiques",
    content: "Les fonctions sont des relations entre ensembles qui associent chaque élément d'un ensemble de départ à un unique élément d'un ensemble d'arrivée.",
    difficulty: 3,
    prerequisites: ["Ensembles", "Relations"],
    learningObjectives: ["Comprendre la notion de fonction", "Identifier le domaine et le codomaine"],
    examples: ["f(x) = 2x + 1", "g(x) = x²"],
    exercises: ["Trouver le domaine de f(x) = 1/(x-2)", "Calculer f(3) pour f(x) = 2x + 1"]
  }
]

export const mockPersonalizedExplanation = {
  title: "Comprendre les fonctions dérivées",
  explanation: "La dérivée d'une fonction mesure comment cette fonction change lorsque son entrée change. C'est comme la vitesse d'une voiture - elle vous dit à quelle vitesse la position change.",
  tone: "beginner" as const,
  complexity: 3,
  examples: ["Si f(x) = x², alors f'(x) = 2x"],
  analogies: ["La dérivée est comme l'accélérateur d'une voiture"],
  practiceExercises: ["Calculer la dérivée de f(x) = 3x + 2"],
  furtherReading: ["Chapitre 3: Applications des dérivées"]
}
