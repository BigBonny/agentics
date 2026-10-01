/**
 * Intégration ERP QualiSoft (Odoo 19) — remontée des formations complétées sur Agentics.
 *
 * Deux modes de transport :
 *   - api : API externe JSON-2 d'Odoo 19 (POST {QUALISOFT_API_URL}/json/2/<modèle>/<méthode>)
 *   - csv : fichier CSV quotidien (import natif Odoo) si aucune API n'est configurée
 *
 * Variables d'environnement (aucun secret en dur) :
 *   QUALISOFT_MODE            'api' | 'csv' | 'disabled'. Défaut : 'api' si URL + clé présentes, sinon 'csv'.
 *                             'disabled' : les formations sont enregistrées mais rien n'est poussé.
 *   QUALISOFT_API_URL         URL de base de l'instance QualiSoft, ex. https://qualisoft.mon-cfa.fr
 *   QUALISOFT_API_KEY         Clé API Odoo d'un utilisateur technique dédié (Préférences → Sécurité du compte)
 *   QUALISOFT_DB              Nom de la base Odoo (en-tête X-Odoo-Database), requis si plusieurs bases
 *   QUALISOFT_SESSION_NAME    Nom des sessions e-learning créées (par formation). Défaut : 'E-learning Agentics'
 *   QUALISOFT_CSV_DIR         Dossier des exports CSV. Défaut : <cwd>/exports/qualisoft
 *   QUALISOFT_PASSING_SCORE   Score (%) à partir duquel un cours est « complété ». Défaut : 70
 *   QUALISOFT_MAX_RETRIES     Tentatives supplémentaires dans un même appel (backoff exponentiel). Défaut : 3
 *   QUALISOFT_MAX_ATTEMPTS    Tentatives cumulées avant abandon par le batch automatique. Défaut : 10
 *   QUALISOFT_TIMEOUT_MS      Timeout HTTP par requête. Défaut : 15000
 *   QUALISOFT_CRON_SECRET     Secret Bearer pour les appels cron vers /api/qualisoft/* (≥ 32 caractères)
 */

import { promises as fs } from 'fs'
import path from 'path'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QualisoftMode = 'api' | 'csv' | 'disabled'
export type SyncStatus = 'pending' | 'synced' | 'failed'
export type SyncTarget = 'api' | 'csv'
export type SyncTrigger = 'completion' | 'manual' | 'batch' | 'cron'

export interface TrainingRecord {
  id: string
  user_id: string
  course_id: string | null
  course_title: string | null
  qualisoft_formation_code: string | null
  score: number | null
  completed_at: string
  certificate_url: string | null
  sync_status: SyncStatus
  sync_target: SyncTarget | null
  qualisoft_record_ref: string | null
  sync_attempts: number
  next_retry_at: string | null
  synced_at: string | null
  sync_error: string | null
  created_at: string
  updated_at: string
}

export interface PushResult {
  recordId: string
  status: SyncStatus
  target?: SyncTarget
  reference?: string | null
  error?: string
  skipped?: boolean
}

export interface BatchResult {
  processed: number
  synced: number
  failed: number
  skipped: number
  results: PushResult[]
}

interface QualisoftConfig {
  mode: QualisoftMode
  apiUrl: string
  apiKey: string
  db: string
  sessionName: string
  csvDir: string
  passingScore: number
  maxRetries: number
  maxAttempts: number
  timeoutMs: number
  cronSecret: string
}

interface LearnerInfo {
  email: string
  first_name: string | null
  last_name: string | null
}

interface SyncContext {
  record: TrainingRecord
  learner: LearnerInfo
  formationCode: string | null
}

export class QualisoftError extends Error {
  readonly retryable: boolean
  readonly httpStatus?: number

  constructor(message: string, retryable: boolean, httpStatus?: number) {
    super(message)
    this.name = 'QualisoftError'
    this.retryable = retryable
    this.httpStatus = httpStatus
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_DELAY_MS = 1_000
const MAX_DELAY_MS = 30_000
const FIRST_BATCH_DELAY_MS = 2 * 60_000 // laisse la synchro immédiate se faire avant que le batch ne reprenne la ligne
const MAX_BATCH_BACKOFF_MS = 24 * 60 * 60_000
const ERROR_MAX_LENGTH = 1_000

function readInt(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const value = Number.parseInt(raw, 10)
  if (Number.isNaN(value)) return fallback
  return Math.min(Math.max(value, min), max)
}

export function getQualisoftConfig(): QualisoftConfig {
  const apiUrl = (process.env.QUALISOFT_API_URL ?? '').trim().replace(/\/+$/, '')
  const apiKey = (process.env.QUALISOFT_API_KEY ?? '').trim()
  const explicitMode = (process.env.QUALISOFT_MODE ?? '').trim().toLowerCase()

  let mode: QualisoftMode
  if (explicitMode === 'api' || explicitMode === 'csv' || explicitMode === 'disabled') {
    mode = explicitMode
  } else {
    mode = apiUrl && apiKey ? 'api' : 'csv'
  }

  return {
    mode,
    apiUrl,
    apiKey,
    db: (process.env.QUALISOFT_DB ?? '').trim(),
    sessionName: (process.env.QUALISOFT_SESSION_NAME ?? '').trim() || 'E-learning Agentics',
    csvDir: (process.env.QUALISOFT_CSV_DIR ?? '').trim() || path.join(process.cwd(), 'exports', 'qualisoft'),
    passingScore: readInt('QUALISOFT_PASSING_SCORE', 70, 0, 100),
    maxRetries: readInt('QUALISOFT_MAX_RETRIES', 3, 0, 10),
    maxAttempts: readInt('QUALISOFT_MAX_ATTEMPTS', 10, 1, 100),
    timeoutMs: readInt('QUALISOFT_TIMEOUT_MS', 15_000, 1_000, 120_000),
    cronSecret: (
    process.env.QUALISOFT_CRON_SECRET ??
    process.env.CRON_SECRET ?? // convention Vercel Cron
    ''
  ).trim(),
  }
}

/** Configuration exposable dans /api/qualisoft/status — jamais de secret. */
export function getPublicQualisoftConfig() {
  const cfg = getQualisoftConfig()
  return {
    mode: cfg.mode,
    apiConfigured: Boolean(cfg.apiUrl && cfg.apiKey),
    apiHost: cfg.apiUrl ? safeHost(cfg.apiUrl) : null,
    database: cfg.db || null,
    sessionName: cfg.sessionName,
    csvDir: cfg.mode === 'csv' ? cfg.csvDir : null,
    passingScore: cfg.passingScore,
    maxRetries: cfg.maxRetries,
    maxAttempts: cfg.maxAttempts,
    cronSecretConfigured: cfg.cronSecret.length >= 32,
  }
}

export function getQualisoftPassingScore(): number {
  return getQualisoftConfig().passingScore
}

/** Vérifie l'en-tête `Authorization: Bearer <QUALISOFT_CRON_SECRET>` (comparaison à temps constant). */
export function verifyCronSecret(request: Request): boolean {
  const secret = getQualisoftConfig().cronSecret
  if (secret.length < 32) return false

  const header = request.headers.get('authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  if (!match) return false

  const provided = Buffer.from(match[1].trim())
  const expected = Buffer.from(secret)
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return typeof err === 'string' ? err : 'Erreur inconnue'
}

function truncate(value: string, max = ERROR_MAX_LENGTH): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Format datetime attendu par Odoo : 'YYYY-MM-DD HH:MM:SS' en UTC. */
function toOdooDatetime(iso: string): string {
  return new Date(iso).toISOString().slice(0, 19).replace('T', ' ')
}

/** Retry avec backoff exponentiel + jitter, uniquement sur erreurs transitoires. */
async function withRetry<T>(operation: () => Promise<T>, maxRetries: number): Promise<T> {
  let attempt = 0
  for (;;) {
    try {
      return await operation()
    } catch (err) {
      const retryable = err instanceof QualisoftError ? err.retryable : true
      if (!retryable || attempt >= maxRetries) throw err

      const delay = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS) + Math.floor(Math.random() * 250)
      attempt++
      console.warn(`[Qualisoft] Échec transitoire (${errorMessage(err)}), nouvelle tentative ${attempt}/${maxRetries} dans ${delay} ms`)
      await sleep(delay)
    }
  }
}

/** Délai avant la prochaine reprise par le batch : 2^tentatives minutes, plafonné à 24 h. */
function nextBatchRetryAt(attempts: number): string {
  const delay = Math.min(2 ** attempts * 60_000, MAX_BATCH_BACKOFF_MS)
  return new Date(Date.now() + delay).toISOString()
}

// ---------------------------------------------------------------------------
// Mapping course → formation et user → apprenant
// ---------------------------------------------------------------------------

/** Code formation QualiSoft associé à un cours (table qualisoft_course_mappings). */
export async function resolveFormationCode(courseId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('qualisoft_course_mappings')
    .select('qualisoft_formation_code')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('[Qualisoft] Erreur lecture qualisoft_course_mappings:', error)
    return null
  }
  return (data as { qualisoft_formation_code: string } | null)?.qualisoft_formation_code ?? null
}

/** Crée ou met à jour la correspondance cours → formation (usage admin). */
export async function upsertCourseMapping(courseId: string, formationCode: string, label?: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('qualisoft_course_mappings')
    .upsert(
      {
        course_id: courseId,
        qualisoft_formation_code: formationCode.trim(),
        qualisoft_formation_label: label ?? null,
        is_active: true,
      },
      { onConflict: 'course_id' }
    )

  if (error) throw new Error(`Impossible d'enregistrer la correspondance : ${error.message}`)
}

type OdooParams = Record<string, unknown>

/** Appel à l'API externe JSON-2 d'Odoo 19. */
async function odooCall<T>(cfg: QualisoftConfig, model: string, method: string, params: OdooParams): Promise<T> {
  if (!cfg.apiUrl || !cfg.apiKey) {
    throw new QualisoftError('Mode api sélectionné mais QUALISOFT_API_URL ou QUALISOFT_API_KEY manquant', false)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `bearer ${cfg.apiKey}`,
  }
  if (cfg.db) headers['X-Odoo-Database'] = cfg.db

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs)

  let response: Response
  try {
    response = await fetch(`${cfg.apiUrl}/json/2/${model}/${method}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      signal: controller.signal,
      cache: 'no-store',
    })
  } catch (err) {
    const reason = controller.signal.aborted ? `timeout après ${cfg.timeoutMs} ms` : errorMessage(err)
    throw new QualisoftError(`QualiSoft injoignable (${model}.${method}) : ${reason}`, true)
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { message?: string; name?: string }
      detail = body.message || body.name || detail
    } catch {
      // corps non JSON : on garde statusText
    }
    const retryable = response.status === 408 || response.status === 429 || response.status >= 500
    throw new QualisoftError(
      `QualiSoft ${response.status} sur ${model}.${method} : ${truncate(detail, 300)}`,
      retryable,
      response.status
    )
  }

  return (await response.json()) as T
}

/** Mapping user → apprenant QualiSoft (res.partner), l'email étant la clé. Créé si absent. */
async function findOrCreateLearnerId(cfg: QualisoftConfig, learner: LearnerInfo): Promise<number> {
  const rows = await odooCall<Array<{ id: number }>>(cfg, 'res.partner', 'search_read', {
    domain: [['email', '=ilike', learner.email]],
    fields: ['id'],
    limit: 2,
  })

  if (rows.length > 1) {
    throw new QualisoftError(`Plusieurs fiches QualiSoft partagent l'email ${learner.email} : dédoublonner côté QualiSoft`, false)
  }
  if (rows.length === 1) return rows[0].id

  const name = [learner.first_name, learner.last_name].filter(Boolean).join(' ').trim() || learner.email
  const ids = await odooCall<number[]>(cfg, 'res.partner', 'create', {
    vals_list: [{ name, email: learner.email, comment: 'Créé automatiquement par Agentics' }],
  })
  if (!Array.isArray(ids) || typeof ids[0] !== 'number') {
    throw new QualisoftError("Réponse inattendue de QualiSoft à la création de l'apprenant", false)
  }
  return ids[0]
}

/** Formation QualiSoft (of.formation) identifiée par son code métier. */
async function findFormationId(cfg: QualisoftConfig, code: string): Promise<number> {
  const rows = await odooCall<Array<{ id: number }>>(cfg, 'of.formation', 'search_read', {
    domain: [['code', '=', code]],
    fields: ['id'],
    limit: 1,
  })
  if (rows.length === 0) {
    throw new QualisoftError(`Aucune formation QualiSoft avec le code « ${code} »`, false)
  }
  return rows[0].id
}

/**
 * Session e-learning dédiée à la formation (modalité 'elearning', type 'individuel'),
 * créée à la demande — une seule session par formation reçoit toutes les complétions Agentics.
 */
async function findOrCreateSessionId(cfg: QualisoftConfig, formationId: number): Promise<number> {
  const rows = await odooCall<Array<{ id: number }>>(cfg, 'of.session', 'search_read', {
    domain: [
      ['formation_id', '=', formationId],
      ['modalite', '=', 'elearning'],
      ['name', '=ilike', cfg.sessionName],
    ],
    fields: ['id'],
    limit: 1,
  })
  if (rows.length > 0) return rows[0].id

  const [{ id: companyId }] = await odooCall<Array<{ id: number }>>(cfg, 'res.company', 'search_read', {
    domain: [],
    fields: ['id'],
    limit: 1,
  })

  const ids = await odooCall<number[]>(cfg, 'of.session', 'create', {
    vals_list: [{
      name: cfg.sessionName,
      formation_id: formationId,
      modalite: 'elearning',
      type_session: 'individuel',
      company_id: companyId,
      date_debut: '2025-01-01',
      date_fin: '2099-12-31',
      nb_places_max: 0,
    }],
  })
  if (!Array.isArray(ids) || typeof ids[0] !== 'number') {
    throw new QualisoftError('Réponse inattendue de QualiSoft à la création de la session e-learning', false)
  }
  return ids[0]
}

/**
 * Inscription (stagiaire, session) → état 'termine'.
 * Idempotent : l'inscription est unique par (apprenant, session e-learning de la formation).
 */
async function upsertInscription(cfg: QualisoftConfig, ctx: SyncContext, formationId: number, sessionId: number, learnerId: number): Promise<number> {
  const existing = await odooCall<Array<{ id: number; state: string }>>(cfg, 'of.inscription', 'search_read', {
    domain: [
      ['stagiaire_id', '=', learnerId],
      ['session_id', '=', sessionId],
    ],
    fields: ['id', 'state'],
    limit: 1,
  })

  const dateInscription = ctx.record.completed_at.slice(0, 10)

  if (existing.length > 0) {
    const vals: Record<string, unknown> = {}
    if (existing[0].state !== 'termine') {
      vals.state = 'termine'
      await odooCall<boolean>(cfg, 'of.inscription', 'write', { ids: [existing[0].id], vals })
    }
    return existing[0].id
  }

  const ids = await odooCall<number[]>(cfg, 'of.inscription', 'create', {
    vals_list: [{
      stagiaire_id: learnerId,
      session_id: sessionId,
      formation_id: formationId,
      state: 'termine',
      date_inscription: dateInscription,
    }],
  })
  if (!Array.isArray(ids) || typeof ids[0] !== 'number') {
    throw new QualisoftError('Réponse inattendue de QualiSoft à la création de l\'inscription', false)
  }
  return ids[0]
}

/** Consigne le score du quiz comme évaluation 'acquis_aval' rattachée à l'inscription. */
async function upsertEvaluation(cfg: QualisoftConfig, ctx: SyncContext, ids: { inscriptionId: number; formationId: number; sessionId: number; learnerId: number }): Promise<void> {
  if (ctx.record.score === null) return

  const existing = await odooCall<Array<{ id: number; score: number }>>(cfg, 'of.evaluation', 'search_read', {
    domain: [
      ['inscription_id', '=', ids.inscriptionId],
      ['type_evaluation', '=', 'acquis_aval'],
    ],
    fields: ['id', 'score'],
    limit: 1,
  })

  const vals = {
    inscription_id: ids.inscriptionId,
    stagiaire_id: ids.learnerId,
    formation_id: ids.formationId,
    session_id: ids.sessionId,
    type_evaluation: 'acquis_aval',
    date: ctx.record.completed_at.slice(0, 10),
    score: ctx.record.score,
    state: 'recue',
    commentaire: `Quiz Agentics « ${ctx.record.course_title ?? 'cours'} » — score ${ctx.record.score}%`,
  }

  if (existing.length > 0) {
    // On conserve le meilleur score en cas de double remontée
    if (ctx.record.score > (existing[0].score ?? 0)) {
      await odooCall<boolean>(cfg, 'of.evaluation', 'write', { ids: [existing[0].id], vals })
    }
    return
  }

  await odooCall<number[]>(cfg, 'of.evaluation', 'create', { vals_list: [{ name: `AGT-${ctx.record.id.slice(0, 8)}`, ...vals }] })
}

/** Push natif QualiSoft : apprenant → formation → session e-learning → inscription 'termine' + évaluation. */
async function upsertInQualisoft(cfg: QualisoftConfig, ctx: SyncContext): Promise<string> {
  const learnerId = await findOrCreateLearnerId(cfg, ctx.learner)
  const formationId = await findFormationId(cfg, ctx.formationCode!)
  const sessionId = await findOrCreateSessionId(cfg, formationId)
  const inscriptionId = await upsertInscription(cfg, ctx, formationId, sessionId, learnerId)
  await upsertEvaluation(cfg, ctx, { inscriptionId, formationId, sessionId, learnerId })
  return `of.inscription:${inscriptionId}`
}

// ---------------------------------------------------------------------------
// Fallback CSV
// ---------------------------------------------------------------------------

const CSV_HEADER = [
  'external_ref',
  'learner_email',
  'learner_last_name',
  'learner_first_name',
  'formation_code',
  'course_title',
  'score',
  'completed_at',
  'certificate_url',
]

function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  let text = String(value)
  // Neutralise l'injection de formules à l'ouverture dans un tableur
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Ajoute la ligne au CSV du jour (séparateur « ; », UTF-8 avec BOM pour Excel FR). Retourne le nom du fichier. */
async function exportToCsv(cfg: QualisoftConfig, ctx: SyncContext): Promise<string> {
  await fs.mkdir(cfg.csvDir, { recursive: true })

  const fileName = `qualisoft_${new Date().toISOString().slice(0, 10)}.csv`
  const filePath = path.join(cfg.csvDir, fileName)

  // Création atomique de l'en-tête (flag wx : échoue si le fichier existe déjà)
  try {
    await fs.writeFile(filePath, `\uFEFF${CSV_HEADER.join(';')}\r\n`, { encoding: 'utf8', flag: 'wx' })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
  }

  const row = [
    ctx.record.id,
    ctx.learner.email,
    ctx.learner.last_name,
    ctx.learner.first_name,
    ctx.formationCode,
    ctx.record.course_title,
    ctx.record.score,
    toOdooDatetime(ctx.record.completed_at),
    ctx.record.certificate_url,
  ]
  await fs.appendFile(filePath, `${row.map(csvCell).join(';')}\r\n`, 'utf8')
  return fileName
}

// ---------------------------------------------------------------------------
// Persistance de l'état de synchro + journal d'audit
// ---------------------------------------------------------------------------

async function loadSyncContext(recordId: string): Promise<SyncContext | null> {
  const { data: record, error } = await supabaseAdmin
    .from('training_records')
    .select('*')
    .eq('id', recordId)
    .maybeSingle()

  if (error) throw new Error(`Lecture training_records impossible : ${error.message}`)
  if (!record) return null

  const typedRecord = record as TrainingRecord

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email, first_name, last_name')
    .eq('id', typedRecord.user_id)
    .single()

  if (userError || !user) throw new Error(`Utilisateur ${typedRecord.user_id} introuvable`)

  const formationCode =
    typedRecord.qualisoft_formation_code ??
    (typedRecord.course_id ? await resolveFormationCode(typedRecord.course_id) : null)

  return { record: typedRecord, learner: user as LearnerInfo, formationCode }
}

async function logSync(entry: {
  recordId: string
  trigger: SyncTrigger
  mode: QualisoftMode
  success: boolean
  httpStatus?: number
  error?: string
  reference?: string | null
  durationMs: number
}): Promise<void> {
  const { error } = await supabaseAdmin.from('qualisoft_sync_logs').insert({
    training_record_id: entry.recordId,
    triggered_by: entry.trigger,
    mode: entry.mode,
    success: entry.success,
    http_status: entry.httpStatus ?? null,
    error: entry.error ? truncate(entry.error) : null,
    qualisoft_record_ref: entry.reference ?? null,
    duration_ms: entry.durationMs,
  })
  if (error) console.error('[Qualisoft] Écriture du journal d\'audit impossible:', error)
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Enregistre (ou met à jour) la complétion d'un cours dans training_records.
 * Une ligne par (apprenant, cours) : une fois synchronisée, elle n'est plus modifiée.
 */
export async function recordCourseCompletion(params: {
  userId: string
  courseId: string
  score: number
  completedAt?: string
  certificateUrl?: string | null
}): Promise<TrainingRecord> {
  const score = Math.round(Math.min(Math.max(params.score, 0), 100) * 100) / 100

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('training_records')
    .select('*')
    .eq('user_id', params.userId)
    .eq('course_id', params.courseId)
    .maybeSingle()

  if (existingError) throw new Error(`Lecture training_records impossible : ${existingError.message}`)

  if (existing) {
    const record = existing as TrainingRecord
    if (record.sync_status === 'synced') return record

    // Non encore synchronisée : on garde le meilleur score et on remet la ligne en file
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('training_records')
      .update({
        score: Math.max(record.score ?? 0, score),
        certificate_url: params.certificateUrl ?? record.certificate_url,
        sync_status: 'pending',
        next_retry_at: new Date(Date.now() + FIRST_BATCH_DELAY_MS).toISOString(),
      })
      .eq('id', record.id)
      .select()
      .single()

    if (updateError || !updated) throw new Error(`Mise à jour training_records impossible : ${updateError?.message}`)
    return updated as TrainingRecord
  }

  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('title')
    .eq('id', params.courseId)
    .maybeSingle()

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('training_records')
    .insert({
      user_id: params.userId,
      course_id: params.courseId,
      course_title: (course as { title: string } | null)?.title ?? null,
      qualisoft_formation_code: await resolveFormationCode(params.courseId),
      score,
      completed_at: params.completedAt ?? new Date().toISOString(),
      certificate_url: params.certificateUrl ?? null,
      sync_status: 'pending',
      next_retry_at: new Date(Date.now() + FIRST_BATCH_DELAY_MS).toISOString(),
    })
    .select()
    .single()

  if (insertError || !inserted) {
    // Course concurrente sur la contrainte UNIQUE(user_id, course_id) : on relit la ligne gagnante
    if (insertError?.code === '23505') {
      const { data: winner } = await supabaseAdmin
        .from('training_records')
        .select('*')
        .eq('user_id', params.userId)
        .eq('course_id', params.courseId)
        .single()
      if (winner) return winner as TrainingRecord
    }
    throw new Error(`Création training_records impossible : ${insertError?.message}`)
  }

  return inserted as TrainingRecord
}

/**
 * Pousse un training_record vers QualiSoft (API ou CSV) avec retry exponentiel.
 * Ne lève pas d'exception sur un échec de synchro : l'échec est persisté (failed) et journalisé.
 * Retourne null si l'enregistrement n'existe pas.
 */
export async function pushTrainingRecord(
  recordId: string,
  options: { trigger?: SyncTrigger } = {}
): Promise<PushResult | null> {
  const cfg = getQualisoftConfig()
  const trigger = options.trigger ?? 'manual'

  const ctx = await loadSyncContext(recordId)
  if (!ctx) return null

  if (ctx.record.sync_status === 'synced') {
    return { recordId, status: 'synced', target: ctx.record.sync_target ?? undefined, reference: ctx.record.qualisoft_record_ref, skipped: true }
  }
  if (cfg.mode === 'disabled') {
    return { recordId, status: ctx.record.sync_status, skipped: true }
  }

  const startedAt = Date.now()
  const attempts = ctx.record.sync_attempts + 1
  const target: SyncTarget = cfg.mode

  try {
    if (!ctx.formationCode) {
      throw new QualisoftError(
        'Aucun code formation QualiSoft associé à ce cours (renseigner qualisoft_course_mappings)',
        false
      )
    }
    if (!ctx.learner.email) {
      throw new QualisoftError("L'utilisateur n'a pas d'email : impossible d'identifier l'apprenant", false)
    }

    const reference =
      target === 'api'
        ? await withRetry(() => upsertInQualisoft(cfg, ctx), cfg.maxRetries)
        : await exportToCsv(cfg, ctx)

    const { error: updateError } = await supabaseAdmin
      .from('training_records')
      .update({
        sync_status: 'synced',
        sync_target: target,
        qualisoft_record_ref: reference,
        qualisoft_formation_code: ctx.formationCode,
        sync_attempts: attempts,
        synced_at: new Date().toISOString(),
        sync_error: null,
        next_retry_at: null,
      })
      .eq('id', recordId)

    if (updateError) {
      // L'envoi a réussi : l'upsert idempotent (external_ref) rend une éventuelle re-synchro sans danger
      console.error('[Qualisoft] Synchro réussie mais état non persisté:', updateError)
    }

    await logSync({ recordId, trigger, mode: cfg.mode, success: true, reference, durationMs: Date.now() - startedAt })
    return { recordId, status: 'synced', target, reference }
  } catch (err) {
    const message = errorMessage(err)
    const httpStatus = err instanceof QualisoftError ? err.httpStatus : undefined

    const { error: updateError } = await supabaseAdmin
      .from('training_records')
      .update({
        sync_status: 'failed',
        sync_target: target,
        qualisoft_formation_code: ctx.formationCode,
        sync_attempts: attempts,
        sync_error: truncate(message),
        next_retry_at: nextBatchRetryAt(attempts),
      })
      .eq('id', recordId)

    if (updateError) console.error('[Qualisoft] Impossible de marquer l\'échec:', updateError)

    console.error(`[Qualisoft] Échec de synchro du training_record ${recordId}:`, message)
    await logSync({ recordId, trigger, mode: cfg.mode, success: false, httpStatus, error: message, durationMs: Date.now() - startedAt })
    return { recordId, status: 'failed', target, error: message }
  }
}

/**
 * Point d'entrée « complétion de cours » : enregistre la formation (awaité, rapide)
 * puis lance la synchro QualiSoft en fire-and-forget. Ne lève jamais d'exception.
 * Si le process s'arrête avant la fin de l'envoi, la ligne reste pending et le batch la reprend.
 */
export async function enqueueQualisoftSync(params: {
  userId: string
  courseId: string
  score: number
  completedAt?: string
}): Promise<string | null> {
  try {
    const record = await recordCourseCompletion(params)
    if (record.sync_status === 'synced') return record.id

    void pushTrainingRecord(record.id, { trigger: 'completion' }).catch((err: unknown) => {
      console.error(`[Qualisoft] Synchro asynchrone en erreur pour ${record.id}:`, errorMessage(err))
    })
    return record.id
  } catch (err) {
    console.error('[Qualisoft] Enregistrement de la complétion impossible:', errorMessage(err))
    return null
  }
}

/**
 * Batch de resynchronisation : reprend les lignes pending/failed dont next_retry_at est échu.
 * force = true ignore le backoff et le plafond QUALISOFT_MAX_ATTEMPTS (relance manuelle admin).
 * Traitement séquentiel pour ne pas saturer QualiSoft.
 */
export async function retryPendingRecords(options: {
  limit?: number
  force?: boolean
  trigger?: SyncTrigger
} = {}): Promise<BatchResult> {
  const cfg = getQualisoftConfig()
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200)
  const trigger = options.trigger ?? 'batch'

  let query = supabaseAdmin
    .from('training_records')
    .select('id')
    .in('sync_status', ['pending', 'failed'])

  if (!options.force) {
    query = query.lte('next_retry_at', new Date().toISOString()).lt('sync_attempts', cfg.maxAttempts)
  }

  const { data, error } = await query.order('created_at', { ascending: true }).limit(limit)
  if (error) throw new Error(`Lecture de la file de synchro impossible : ${error.message}`)

  const result: BatchResult = { processed: 0, synced: 0, failed: 0, skipped: 0, results: [] }

  for (const row of (data ?? []) as Array<{ id: string }>) {
    const pushResult = await pushTrainingRecord(row.id, { trigger })
    if (!pushResult) continue

    result.processed++
    result.results.push(pushResult)
    if (pushResult.skipped) result.skipped++
    else if (pushResult.status === 'synced') result.synced++
    else if (pushResult.status === 'failed') result.failed++
  }

  return result
}
