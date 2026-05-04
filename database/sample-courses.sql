-- Sample courses data for Agentics Révision
-- Run this in Supabase SQL Editor to populate your database

-- Insert sample courses
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
  ARRAY['Notions de base en algèbre', 'Calcul différentiel']::text[],
  ARRAY['Résoudre des équations linéaires', 'Comprendre les matrices', 'Appliquer les transformations géométriques', 'Analyser les espaces vectoriels']::text[],
  ARRAY['Vecteurs', 'Matrices', 'Espaces vectoriels', 'Applications linéaires', 'Valeurs propres et vecteurs propres']::text[],
  6,
  true,
  (SELECT id FROM users LIMIT 1)
),
(
  'Calcul Différentiel et Intégral',
  'Introduction complète au calcul différentiel et intégral avec applications pratiques en sciences et ingénierie.',
  'mathématiques',
  4,
  20,
  ARRAY['Fonctions et graphiques', 'Notions de base en algèbre']::text[],
  ARRAY['Calculer les dérivées', 'Résoudre les intégrales', 'Appliquer les théorèmes fondamentaux', 'Analyser les fonctions']::text[],
  ARRAY['Limites et continuité', 'Dérivées', 'Intégrales', 'Applications du calcul', 'Séries infinies']::text[],
  5,
  true,
  (SELECT id FROM users LIMIT 1)
),
(
  'Physique Mécanique',
  'Étude des principes fondamentaux de la mécanique classique, incluant la cinématique, dynamique et énergie.',
  'physique',
  3,
  18,
  ARRAY['Mathématiques de base', 'Notions de force']::text[],
  ARRAY['Comprendre les lois du mouvement', 'Analyser les forces et l''énergie', 'Résoudre des problèmes de mécanique']::text[],
  ARRAY['Cinématique', 'Dynamique', 'Travail et énergie', 'Momentum', 'Oscillations']::text[],
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
  ARRAY['Chimie générale', 'Notions de base en physique']::text[],
  ARRAY['Identifier les groupes fonctionnels', 'Comprendre les mécanismes réactionnels', 'Analyser les molécules organiques']::text[],
  ARRAY['Structure moléculaire', 'Groupes fonctionnels', 'Réactions organiques', 'Synthèse', 'Spectroscopie']::text[],
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
  ARRAY['Comprendre la structure cellulaire', 'Analyser les processus métaboliques', 'Expliquer la division cellulaire']::text[],
  ARRAY['Membrane cellulaire', 'Organites cellulaires', 'Métabolisme', 'Division cellulaire', 'Génétique']::text[],
  3,
  true,
  (SELECT id FROM users LIMIT 1)
);

-- Insert sample course content
INSERT INTO course_content (course_id, title, content, type, order_index, duration_minutes) VALUES 
-- Algèbre Linéaire content
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Introduction aux vecteurs', 'Les vecteurs sont des objets mathématiques qui ont à la fois une magnitude et une direction. Ils sont fondamentaux en physique et en ingénierie.', 'lesson', 1, 45),
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Exercices sur les vecteurs', 'Pratiquez les opérations vectorielles: addition, soustraction, multiplication par un scalaire.', 'exercise', 2, 30),
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Introduction aux matrices', 'Les matrices sont des tableaux rectangulaires de nombres utilisés pour représenter des transformations linéaires.', 'lesson', 3, 60),
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Opérations matricielles', 'Apprenez à additionner, multiplier et inverser des matrices.', 'exercise', 4, 45),

-- Calcul content
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Limites et continuité', 'Introduction au concept de limite et son importance en calcul.', 'lesson', 1, 50),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Exercices sur les limites', 'Pratiquez le calcul de limites de diverses fonctions.', 'exercise', 2, 40),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Introduction aux dérivées', 'Comprendre la notion de dérivée comme taux de variation instantané.', 'lesson', 3, 55),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Règles de dérivation', 'Apprenez les règles de base: produit, quotient, chaîne.', 'exercise', 4, 50),

-- Physique content
((SELECT id FROM courses WHERE title = 'Physique Mécanique'), 'Introduction à la cinématique', 'Étude du mouvement sans considérer les forces qui le causent.', 'lesson', 1, 45),
((SELECT id FROM courses WHERE title = 'Physique Mécanique'), 'Problèmes de mouvement', 'Résolvez des problèmes de vitesse, accélération et trajectoire.', 'exercise', 2, 35),
((SELECT id FROM courses WHERE title = 'Physique Mécanique'), 'Lois de Newton', 'Les trois lois fondamentales de la mécanique classique.', 'lesson', 3, 60),
((SELECT id FROM courses WHERE title = 'Physique Mécanique'), 'Applications des lois de Newton', 'Analysez des systèmes de forces et accélérations.', 'exercise', 4, 45);

-- Insert sample quizzes
INSERT INTO quizzes (course_id, title, description, time_limit_minutes, passing_score, max_attempts, is_published) VALUES 
((SELECT id FROM courses WHERE title = 'Algèbre Linéaire Fondamentale'), 'Quiz: Vecteurs et Matrices', 'Testez vos connaissances sur les vecteurs et matrices de base.', 30, 70, 3, true),
((SELECT id FROM courses WHERE title = 'Calcul Différentiel et Intégral'), 'Quiz: Limites et Dérivées', 'Évaluez votre compréhension des limites et dérivées.', 45, 75, 3, true),
((SELECT id FROM courses WHERE title = 'Physique Mécanique'), 'Quiz: Cinématique et Dynamique', 'Testez vos connaissances en mécanique classique.', 40, 70, 3, true),
((SELECT id FROM courses WHERE title = 'Chimie Organique'), 'Quiz: Groupes Fonctionnels', 'Quiz sur l''identification des groupes fonctionnels en chimie organique.', 25, 65, 3, true),
((SELECT id FROM courses WHERE title = 'Biologie Cellulaire'), 'Quiz: Structure Cellulaire', 'Test sur les organites et fonctions cellulaires.', 20, 60, 3, true);

-- Insert sample questions
INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, difficulty) VALUES 
-- Algèbre Linéaire questions
((SELECT id FROM quizzes WHERE title = 'Quiz: Vecteurs et Matrices'), 'Quelle est la résultante de deux vecteurs de même magnitude et de directions opposées?', 'multiple_choice', ARRAY['Le vecteur nul', 'Un vecteur de même magnitude', 'Un vecteur de double magnitude', 'Un vecteur perpendiculaire']::text[], 'Le vecteur nul', 'Lorsque deux vecteurs de même magnitude s''opposent, ils s''annulent mutuellement.', 2, 3),
((SELECT id FROM quizzes WHERE title = 'Quiz: Vecteurs et Matrices'), 'Quelle est la dimension d''une matrice 3x4?', 'multiple_choice', ARRAY['3 lignes, 4 colonnes', '4 lignes, 3 colonnes', '3 éléments', '4 éléments']::text[], '3 lignes, 4 colonnes', 'La première dimension représente les lignes, la seconde les colonnes.', 1, 2),

-- Calcul questions
((SELECT id FROM quizzes WHERE title = 'Quiz: Limites et Dérivées'), 'Que représente la dérivée d''une fonction en un point?', 'multiple_choice', ARRAY['La valeur de la fonction', 'Le taux de variation instantané', 'L''aire sous la courbe', 'La pente moyenne']::text[], 'Le taux de variation instantané', 'La dérivée représente la pente de la tangente à la courbe en ce point.', 3, 4),
((SELECT id FROM quizzes WHERE title = 'Quiz: Limites et Dérivées'), 'Quelle est la dérivée de f(x) = x²?', 'multiple_choice', ARRAY['2x', 'x', '2', 'x²']::text[], '2x', 'En appliquant la règle de puissance: d/dx(x^n) = nx^(n-1)', 2, 2),

-- Physique questions
((SELECT id FROM quizzes WHERE title = 'Quiz: Cinématique et Dynamique'), 'Quelle est l''unité SI de la force?', 'multiple_choice', ARRAY['Newton', 'Joule', 'Watt', 'Pascal']::text[], 'Newton', 'Le Newton (N) est l''unité de force dans le système international.', 1, 1),
((SELECT id FROM quizzes WHERE title = 'Quiz: Cinématique et Dynamique'), 'Que dit la première loi de Newton?', 'multiple_choice', ARRAY['F = ma', 'Action = réaction', 'Un corps au repos reste au repos', 'Énergie = masse × vitesse²']::text[], 'Un corps au repos reste au repos', 'Première loi: principe d''inertie - un corps conserve son état de mouvement.', 2, 3);
