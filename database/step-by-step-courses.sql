-- Step-by-step course insertion - isolate the array issue
-- Run this after the simple test works

-- Step 1: Insert one course with minimal arrays
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
  ARRAY['Notions de base en algèbre']::text[],
  ARRAY['Résoudre des équations linéaires']::text[],
  ARRAY['Vecteurs', 'Matrices']::text[],
  6,
  true,
  (SELECT id FROM users LIMIT 1)
);

-- Step 2: Insert second course
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
  'Calcul Différentiel et Intégral',
  'Introduction complète au calcul différentiel et intégral avec applications pratiques en sciences et ingénierie.',
  'mathématiques',
  4,
  20,
  ARRAY['Fonctions et graphiques']::text[],
  ARRAY['Calculer les dérivées', 'Résoudre les intégrales']::text[],
  ARRAY['Limites et continuité', 'Dérivées']::text[],
  5,
  true,
  (SELECT id FROM users LIMIT 1)
);

-- If these work, then the issue is with larger arrays
-- If these fail, then there's a different problem
