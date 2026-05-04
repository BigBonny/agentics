export interface Course {
  id: string
  title: string
  description: string
  subject: string
  level: number
  duration_hours: number
  prerequisites: string[]
  learning_objectives: string[]
  topics: string[]
  difficulty: number
  is_published: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CourseContent {
  id: string
  course_id: string
  title: string
  content: string
  type: 'lesson' | 'exercise' | 'video' | 'reading'
  order_index: number
  duration_minutes?: number
  embedding?: number[]
  created_at: string
}

export interface Quiz {
  id: string
  course_id: string
  title: string
  description?: string
  time_limit_minutes?: number
  passing_score: number
  max_attempts: number
  is_published: boolean
  created_at: string
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]
  correct_answer: string
  explanation?: string
  points: number
  difficulty: number
  topic?: string
  embedding?: number[]
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  attempt_number: number
  score: number
  max_score: number
  started_at: string
  completed_at?: string
  time_taken_minutes?: number
  answers: Record<string, any>
  feedback?: any
  passed: boolean
}

export interface CourseEnrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  completed_at?: string
  progress_percentage: number
  last_accessed_at: string
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  content_id: string
  completed: boolean
  completion_time: string
  time_spent_minutes: number
}

export interface GeneratedQuiz {
  title: string
  description: string
  time_limit_minutes: number
  passing_score: number
  questions: GeneratedQuestion[]
}

export interface GeneratedQuestion {
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correct_answer: string
  explanation: string
  points: number
  difficulty: number
  topic: string
}

export interface AIRecommendation {
  type: 'course' | 'exercise' | 'content' | 'quiz'
  item_id: string
  title: string
  description: string
  reason: string
  confidence_score: number
  priority: 'high' | 'medium' | 'low'
}
