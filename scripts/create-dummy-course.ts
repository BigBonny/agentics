import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
