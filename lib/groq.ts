/**
 * Client Groq partagé avec chaîne de repli sur les modèles.
 * Groq décommissionne régulièrement des modèles (ex. llama-3.3-70b-versatile) —
 * on réessaie automatiquement les suivants sur `model_not_found`.
 * `GROQ_MODEL` dans l'env force un modèle précis.
 */

import Groq from 'groq-sdk'

export const GROQ_MODEL_FALLBACKS = [
  'openai/gpt-oss-120b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'qwen/qwen3-32b',
  'llama-3.1-8b-instant',
]

let _client: Groq | null = null
export function getGroq(): Groq {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY non configurée')
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _client
}

function isModelNotFound(error: any): boolean {
  const code = error?.code || error?.error?.code
  const msg = String(error?.message || '')
  return (
    code === 'model_not_found' ||
    /does not exist|decommissioned|no longer supported/i.test(msg)
  )
}

type ChatParams = {
  messages: Array<{ role: string; content: string }>
  temperature?: number
  max_tokens?: number
  response_format?: { type: string }
  model?: string
}

/** chat.completions.create avec repli automatique sur les modèles dispo. */
export async function groqChat(params: ChatParams): Promise<{ choices: Array<{ message?: { content?: string | null } }> }> {
  const groq = getGroq()
  const candidates = [
    ...(process.env.GROQ_MODEL ? [process.env.GROQ_MODEL] : []),
    ...(params.model ? [params.model] : []),
    ...GROQ_MODEL_FALLBACKS,
  ].filter((m, i, a) => a.indexOf(m) === i)

  let lastError: any
  for (const model of candidates) {
    try {
      return (await groq.chat.completions.create({ ...params, model } as any)) as any
    } catch (e: any) {
      lastError = e
      if (!isModelNotFound(e)) throw e // erreur réelle (clé, quota, contenu) : on remonte
      console.warn(`[groq] modèle ${model} indisponible, essai suivant`)
    }
  }
  throw lastError
}
