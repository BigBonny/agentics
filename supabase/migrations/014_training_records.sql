-- =====================================================================
-- 014_training_records.sql
-- Intégration ERP QualiSoft : remontée des formations complétées sur Agentics
--
--   qualisoft_course_mappings : correspondance cours Agentics → code formation QualiSoft
--   training_records          : une ligne par (apprenant, cours) complété + état de synchro
--   qualisoft_sync_logs       : journal d'audit de chaque tentative de synchro
--
-- Écritures : uniquement côté serveur via service_role (supabaseAdmin), qui contourne la RLS.
-- Lecture   : un utilisateur ne voit que ses propres training_records.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Correspondance cours → formation QualiSoft
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qualisoft_course_mappings (
  course_id UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  qualisoft_formation_code TEXT NOT NULL CHECK (length(trim(qualisoft_formation_code)) > 0),
  qualisoft_formation_label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qualisoft_mappings_code
  ON qualisoft_course_mappings(qualisoft_formation_code);

COMMENT ON TABLE qualisoft_course_mappings IS
  'Correspondance cours Agentics → code formation QualiSoft (renseignée par un administrateur)';

-- ---------------------------------------------------------------------
-- 2. Formations complétées
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- SET NULL : la suppression d'un cours (cf. /api/courses/batch-delete) ne doit pas
  -- effacer la preuve de formation ; le titre est conservé dans course_title.
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  course_title TEXT,
  qualisoft_formation_code TEXT,
  score NUMERIC(5,2) CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  certificate_url TEXT,

  -- État de synchronisation
  sync_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (sync_status IN ('pending', 'synced', 'failed')),
  sync_target TEXT CHECK (sync_target IS NULL OR sync_target IN ('api', 'csv')),
  qualisoft_record_ref TEXT,          -- id de l'enregistrement QualiSoft (mode api) ou fichier CSV (mode csv)
  sync_attempts INTEGER NOT NULL DEFAULT 0 CHECK (sync_attempts >= 0),
  next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- backoff exponentiel entre deux batchs
  synced_at TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_training_records_user_id ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_course_id ON training_records(course_id);
CREATE INDEX IF NOT EXISTS idx_training_records_completed_at ON training_records(completed_at);
CREATE INDEX IF NOT EXISTS idx_training_records_sync_status ON training_records(sync_status);
-- Index partiel pour le batch de resynchronisation (seules les lignes non synchronisées)
CREATE INDEX IF NOT EXISTS idx_training_records_retry_queue
  ON training_records(next_retry_at)
  WHERE sync_status <> 'synced';

COMMENT ON TABLE training_records IS
  'Formations complétées sur Agentics, à remonter dans QualiSoft (traçabilité Qualiopi)';

-- ---------------------------------------------------------------------
-- 3. Journal d'audit des synchronisations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qualisoft_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_record_id UUID REFERENCES training_records(id) ON DELETE SET NULL,
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('completion', 'manual', 'batch', 'cron')),
  mode TEXT NOT NULL CHECK (mode IN ('api', 'csv', 'disabled')),
  success BOOLEAN NOT NULL,
  http_status INTEGER,
  error TEXT,
  qualisoft_record_ref TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qualisoft_sync_logs_record ON qualisoft_sync_logs(training_record_id);
CREATE INDEX IF NOT EXISTS idx_qualisoft_sync_logs_created_at ON qualisoft_sync_logs(created_at DESC);

COMMENT ON TABLE qualisoft_sync_logs IS
  'Journal d''audit : une ligne par tentative de synchronisation vers QualiSoft';

-- ---------------------------------------------------------------------
-- 4. Triggers updated_at (fonction créée en 001_initial_schema.sql)
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_training_records_updated_at ON training_records;
CREATE TRIGGER update_training_records_updated_at
  BEFORE UPDATE ON training_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qualisoft_mappings_updated_at ON qualisoft_course_mappings;
CREATE TRIGGER update_qualisoft_mappings_updated_at
  BEFORE UPDATE ON qualisoft_course_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- 5. RLS
--   Aucune policy d'écriture : seul service_role (routes serveur) écrit.
--   Identifiant Clerk lu via auth.jwt() ->> 'sub' : auth.uid() caste en UUID
--   et échoue sur les identifiants Clerk ("user_...").
-- ---------------------------------------------------------------------
ALTER TABLE qualisoft_course_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualisoft_sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own training records" ON training_records;
CREATE POLICY "Users can view own training records" ON training_records
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = (auth.jwt() ->> 'sub'))
  );

GRANT ALL ON qualisoft_course_mappings TO service_role;
GRANT ALL ON training_records TO service_role;
GRANT ALL ON qualisoft_sync_logs TO service_role;

SELECT 'Migration 014 : training_records + qualisoft_course_mappings + qualisoft_sync_logs créés' AS status;
