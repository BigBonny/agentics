import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
)

// Database types
export interface User {
  id: string
  clerk_id: string
  email: string
  first_name: string
  last_name: string
  subscription_tier: 'free' | 'premium' | 'center'
  subscription_status: 'active' | 'inactive' | 'cancelled'
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  user_id: string
  subject: string
  score: number
  max_score: number
  responses: any
  feedback: any
  created_at: string
}

export interface Progress {
  id: string
  user_id: string
  subject: string
  topic: string
  mastery_level: number
  last_accessed: string
  time_spent: number
}

export interface StudySession {
  id: string
  user_id: string
  subject: string
  topic: string
  duration: number
  activities: any
  created_at: string
}

export interface Content {
  id: string
  subject: string
  topic: string
  title: string
  content: string
  difficulty: number
  prerequisites: string[]
  learning_objectives: string[]
  created_at: string
}
