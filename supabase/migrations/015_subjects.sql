-- Matières (of.formation.module) + chapitres (of.formation.module.chapitre) synchronisés
-- depuis QualiSoft, avec extensions locales (source='agentics') et rattachement des cours.

CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qualisoft_id INTEGER UNIQUE,           -- id of.formation.module (NULL = matière locale)
  formation_code TEXT,                   -- code of.formation parent (ex. 'BTS CIEL1')
  formation_label TEXT,                  -- nom lisible de la formation
  name TEXT NOT NULL,
  code TEXT,                             -- ex. 'CGE-11'
  description TEXT,                      -- contenu pédagogique (HTML nettoyé côté app)
  objectifs TEXT,
  evaluation TEXT,
  semestre TEXT,
  duree_heures NUMERIC,
  coefficient NUMERIC,
  obligatoire BOOLEAN DEFAULT true,
  enseignant TEXT,
  sequence INTEGER DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'qualisoft' CHECK (source IN ('qualisoft', 'agentics')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subject_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  qualisoft_id INTEGER UNIQUE,           -- id of.formation.module.chapitre (NULL = chapitre local)
  parent_id UUID REFERENCES subject_chapters(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type_chapitre TEXT,                    -- 'cours' | 'evaluation' | 'td' | 'tp' | …
  sous_type_evaluation TEXT,
  objectifs TEXT,
  competences_visees TEXT,
  duree_heures NUMERIC,
  sequence INTEGER DEFAULT 0,
  niveau INTEGER DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'qualisoft' CHECK (source IN ('qualisoft', 'agentics')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES subject_chapters(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subject_chapters_subject ON subject_chapters(subject_id, sequence);
CREATE INDEX IF NOT EXISTS idx_courses_chapter ON courses(chapter_id);
CREATE INDEX IF NOT EXISTS idx_subjects_formation ON subjects(formation_code);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_chapters ENABLE ROW LEVEL SECURITY;

-- Lecture publique (les pages /subjects et /api/subjects utilisent aussi le rôle service)
CREATE POLICY subjects_select ON subjects FOR SELECT USING (true);
CREATE POLICY subject_chapters_select ON subject_chapters FOR SELECT USING (true);
