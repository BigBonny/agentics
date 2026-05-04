-- Final working version - clean syntax
-- This version creates user first, then courses, ensuring foreign key constraints are satisfied

-- Step 1: Create mock user
INSERT INTO users (
  clerk_id,
  email,
  first_name,
  last_name,
  subscription_tier,
  subscription_status
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'Test',
  'User',
  'free',
  'active'
);

-- Step 2: Insert courses with user reference
INSERT INTO courses (
  title, 
  description, 
  subject, 
  level, 
  duration_hours, 
  prerequisites, 
  learning_objectives, 
  topics, 
  difficulty, 
  is_published,
  created_by
) VALUES 
(
  'Algèbre Linéaire Fondamentale',
  'Ce cours couvre les bases de l''algèbre linéaire, incluant les vecteurs, matrices, et espaces vectoriels. Idéal pour les étudiants en sciences et ingénierie.',
  'mathématiques',
  5,
  15,
  ARRAY['Notions de base en algèbre', 'Calcul différentiel'],
  ARRAY['Résoudre des équations linéaires', 'Comprendre les matrices', 'Appliquer les transformations géométriques', 'Analyser les espaces vectoriels'],
  ARRAY['Vecteurs', 'Matrices', 'Espaces vectoriels', 'Applications linéaires', 'Valeurs propres et vecteurs propres'],
  6,
  true,
  (SELECT id FROM users WHERE clerk_id = '00000000-0000-0000-0000-000000000001' LIMIT 1)
),
(
  'Calcul Différentiel et Intégral',
  'Introduction complète au calcul différentiel et intégral avec applications pratiques en sciences et ingénierie.',
  'mathématiques',
  4,
  20,
  ARRAY['Fonctions et graphiques', 'Notions de base en algèbre'],
  ARRAY['Calculer les dérivées', 'Résoudre les intégrales', 'Appliquer les théorèmes fondamentaux', 'Analyser les fonctions'],
  ARRAY['Limites et continuité', 'Dérivées', 'Intégrales', 'Applications du calcul', 'Séries infinies'],
  5,
  true,
  (SELECT id FROM users WHERE clerk_id = '00000000-0000-0000-0000-000000000001' LIMIT 1)
),
(
  'Physique Mécanique',
  'Étude des principes fondamentaux de la mécanique classique, incluant la cinématique, dynamique et énergie.',
  'physique',
  3,
  18,
  ARRAY['Mathématiques de base', 'Notions de force'],
  ARRAY['Comprendre les lois du mouvement', 'Analyser les forces et l''énergie', 'Résoudre des problèmes de mécanique'],
  ARRAY['Cinématique', 'Dynamique', 'Travail et énergie', 'Momentum', 'Oscillations'],
  4,
  true,
  (SELECT id FROM users WHERE clerk_id = '00000000-0000-0000-0000-000000000001' LIMIT 1)
);

-- Step 3: Add course content
INSERT INTO course_content (course_id, title, content, type, order_index, duration_minutes) VALUES 
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Introduction aux vecteurs', 'Les vecteurs sont des objets mathématiques qui ont à la fois une magnitude et une direction. Ils sont fondamentaux en physique et en ingénierie.', 'lesson', 1, 45),
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Exercices sur les vecteurs', 'Pratiquez les opérations vectorielles: addition, soustraction, multiplication par un scalaire.', 'exercise', 2, 30),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Limites et continuité', 'Introduction au concept de limite et continuité des fonctions.', 'lesson', 1, 50),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Exercices sur les limites', 'Pratiquez le calcul de limites de diverses fonctions.', 'exercise', 2, 40);

-- Step 4: Add quizzes
INSERT INTO quizzes (course_id, title, description, time_limit_minutes, passing_score, max_attempts, is_published) VALUES 
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Quiz: Vecteurs et Matrices', 'Testez vos connaissances sur les vecteurs et matrices de base.', 30, 70, 3, true),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Quiz: Limites et Dérivées', 'Évaluez votre compréhension des limites et dérivées.', 45, 75, 3, true),
((SELECT id FROM courses WHERE title = 'Physique Mécanique'), 'Quiz: Cinématique et Dynamique', 'Testez vos connaissances en mécanique classique.', 40, 70, 3, true);

-- Step 5: Add questions with TEXT[] options
INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, difficulty) VALUES 
((SELECT id FROM quizzes WHERE title = 'Quiz: Vecteurs et Matrices'), 'Quelle est la résultante de deux vecteurs de même magnitude et de directions opposées?', 'multiple_choice', ARRAY['Le vecteur nul', 'Un vecteur de même magnitude', 'Un vecteur de double magnitude', 'Un vecteur perpendiculaire'], 'Le vecteur nul', 'Lorsque deux vecteurs de même magnitude s''opposent, ils s''annulent mutuellement.', 2, 3),
((SELECT id FROM quizzes WHERE title = 'Quiz: Vecteurs et Matrices'), 'Quelle est la dimension d''une matrice 3x4?', 'multiple_choice', ARRAY['3 lignes, 4 colonnes', '4 lignes, 3 colonnes', '3 éléments', '4 éléments'], '3 lignes, 4 colonnes', 'La première dimension représente les lignes, la seconde les colonnes.', 1, 2);
