-- Complete sample data - broken into smaller chunks
-- Run this after step-by-step test works

-- Step 3: Add remaining courses with smaller arrays
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
  'Physique Mécanique',
  'Étude des principes fondamentaux de la mécanique classique, incluant la cinématique, dynamique et énergie.',
  'physique',
  3,
  18,
  ARRAY['Mathématiques de base']::text[],
  ARRAY['Comprendre les lois du mouvement']::text[],
  ARRAY['Cinématique', 'Dynamique']::text[],
  4,
  true,
  (SELECT id FROM users LIMIT 1)
),
(
  'Chimie Organique',
  'Introduction aux composés organiques, leurs structures, réactions et applications dans la vie quotidienne.',
  'chimie',
  6,
  25,
  ARRAY['Chimie générale']::text[],
  ARRAY['Identifier les groupes fonctionnels']::text[],
  ARRAY['Structure moléculaire', 'Groupes fonctionnels']::text[],
  7,
  true,
  (SELECT id FROM users LIMIT 1)
),
(
  'Biologie Cellulaire',
  'Exploration approfondie de la structure et fonction des cellules, base de tous les organismes vivants.',
  'biologie',
  2,
  12,
  ARRAY['Notions de base en chimie']::text[],
  ARRAY['Comprendre la structure cellulaire']::text[],
  ARRAY['Membrane cellulaire', 'Organites cellulaires']::text[],
  3,
  true,
  (SELECT id FROM users LIMIT 1)
);

-- Step 4: Add course content
INSERT INTO course_content (course_id, title, content, type, order_index, duration_minutes) VALUES 
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Introduction aux vecteurs', 'Les vecteurs sont des objets mathématiques qui ont à la fois une magnitude et une direction. Ils sont fondamentaux en physique et en ingénierie.', 'lesson', 1, 45),
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Exercices sur les vecteurs', 'Pratiquez les opérations vectorielles: addition, soustraction, multiplication par un scalaire.', 'exercise', 2, 30),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Limites et continuité', 'Introduction au concept de limite et continuité des fonctions.', 'lesson', 1, 50),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Exercices sur les limites', 'Pratiquez le calcul de limites de diverses fonctions.', 'exercise', 2, 40);

-- Step 5: Add quizzes
INSERT INTO quizzes (course_id, title, description, time_limit_minutes, passing_score, max_attempts, is_published) VALUES 
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Quiz: Vecteurs et Matrices', 'Testez vos connaissances sur les vecteurs et matrices de base.', 30, 70, 3, true),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Quiz: Limites et Dérivées', 'Évaluez votre compréhension des limites et dérivées.', 45, 75, 3, true),
((SELECT id FROM courses WHERE title = 'Physique Mécanique'), 'Quiz: Cinématique et Dynamique', 'Testez vos connaissances en mécanique classique.', 40, 70, 3, true),
((SELECT id FROM courses WHERE title = 'Chimie Organique'), 'Quiz: Groupes Fonctionnels', 'Quiz sur l''identification des groupes fonctionnels en chimie organique.', 25, 65, 3, true),
((SELECT id FROM courses WHERE title = 'Biologie Cellulaire'), 'Quiz: Structure Cellulaire', 'Test sur les organites et fonctions cellulaires.', 20, 60, 3, true);

-- Step 6: Add questions with smaller arrays
INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, difficulty) VALUES 
((SELECT id FROM quizzes WHERE title = 'Quiz: Vecteurs et Matrices'), 'Quelle est la résultante de deux vecteurs de même magnitude et de directions opposées?', 'multiple_choice', ARRAY['Le vecteur nul', 'Un vecteur de même magnitude']::text[], 'Le vecteur nul', 'Lorsque deux vecteurs de même magnitude s''opposent, ils s''annulent mutuellement.', 2, 3),
((SELECT id FROM quizzes WHERE title = 'Quiz: Vecteurs et Matrices'), 'Quelle est la dimension d''une matrice 3x4?', 'multiple_choice', ARRAY['3 lignes, 4 colonnes']::text[], '3 lignes, 4 colonnes', 'La première dimension représente les lignes, la seconde les colonnes.', 1, 2),
((SELECT id FROM quizzes WHERE title = 'Quiz: Limites et Dérivées'), 'Que représente la dérivée d''une fonction en un point?', 'multiple_choice', ARRAY['La valeur de la fonction', 'Le taux de variation']::text[], 'Le taux de variation instantané', 'La dérivée représente la pente de la tangente à la courbe en ce point.', 3, 4),
((SELECT id FROM quizzes WHERE title = 'Quiz: Limites et Dérivées'), 'Quelle est la dérivée de f(x) = x²?', 'multiple_choice', ARRAY['2x', 'x']::text[], '2x', 'En appliquant la règle de puissance: d/dx(x^n) = nx^(n-1)', 2, 2),
((SELECT id FROM quizzes WHERE title = 'Quiz: Cinématique et Dynamique'), 'Quelle est l''unité SI de la force?', 'multiple_choice', ARRAY['Newton', 'Joule']::text[], 'Newton', 'Le Newton (N) est l''unité de force dans le système international.', 1, 1),
((SELECT id FROM quizzes WHERE title = 'Quiz: Cinématique et Dynamique'), 'Que dit la première loi de Newton?', 'multiple_choice', ARRAY['F = ma', 'Action = réaction']::text[], 'Un corps au repos reste au repos', 'Première loi: principe d''inertie - un corps conserve son état de mouvement.', 2, 3);
