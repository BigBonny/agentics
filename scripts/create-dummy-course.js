const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wqkzmjswszjwvlxvbdfj.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxa3ptanN3c3pqd3ZseHZiZGZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjk3NDk1MSwiZXhwIjoyMDUyNTUwOTUxfQ.Hq8q8Y0h7Q0h7Q0h7Q0h7Q0h7Q0h7Q0h7Q0h7Q0h7Q'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const dummyCourse = {
  title: 'Introduction aux Mathématiques',
  description: 'Un cours complet sur les fondamentaux des mathématiques, incluant l\'algèbre, la géométrie et les fonctions.',
  subject: 'mathématiques',
  level: 6,
  difficulty: 'débutant',
  duration: 120,
  price: 0,
  is_published: true,
  thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
  pdf_url: null,
  created_by: 'system',
  topics: ['algèbre', 'géométrie', 'fonctions', 'équations'],
  learning_objectives: [
    'Comprendre les concepts fondamentaux de l\'algèbre',
    'Maîtriser les équations linéaires et quadratiques',
    'Appliquer les principes de géométrie',
    'Analyser les fonctions et leurs graphiques'
  ],
  prerequisites: ['connaissances de base en arithmétique']
}

async function createDummyCourse() {
  try {
    console.log('Creating dummy course...')
    console.log('Supabase URL:', supabaseUrl)
    
    const { data, error } = await supabase
      .from('courses')
      .insert(dummyCourse)
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      process.exit(1)
    }

    console.log('✅ Dummy course created successfully:', data)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createDummyCourse()
