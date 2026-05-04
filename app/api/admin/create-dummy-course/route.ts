import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
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

    console.log('Creating dummy course...')

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert(dummyCourse)
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Dummy course created successfully:', data)
    return NextResponse.json({ success: true, course: data })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
