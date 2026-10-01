# Agentics — Système RAG Agentique & Intégration Qualisoft

Réponse à la demande : architecture RAG indépendant, stack logicielle, dimensionnement VPS OVH (300–1000 utilisateurs), et livraison du code pour intégration ERP Qualisoft.

---

## 1. État actuel du projet (constat)

Le code existant contient déjà les fondations :

| Élément | État | Détail |
|---|---|---|
| Frontend | ✅ | Next.js 14 + TypeScript + Tailwind |
| Auth | ✅ | Clerk (webhook de sync vers Supabase) |
| BDD | ✅ | Supabase (PostgreSQL) avec **pgvector déjà activé** (`VECTOR(1536)`, index `ivfflat` sur `content` et `course_content`) |
| Agents IA | ⚠️ | `lib/ai-agents.ts` : EvaluatorAgent, CuratorAgent, MentorAgent — mais le **Curateur est simulé** (mock, pas de vraie recherche vectorielle) |
| LLM | ✅ | OpenAI GPT-4 (`lib/ai-agents.ts`, `lib/quiz-generator.ts`, `lib/recommendation-engine.ts`), Groq `llama-3.3-70b-versatile` (`app/api/ai/quiz`), GPT-4 Vision (`app/api/ai/extract-content`) |
| Ingestion PDF | ⚠️ | `pdf-parse` / `pdfjs-dist` présents, upload via Supabase Storage, mais pas de pipeline chunking → embeddings |
| Paiement | ✅ | Stripe + webhooks |

**Conclusion :** le schéma vectoriel existe déjà — il manque le pipeline d'ingestion (chunking + embeddings), le retriever, et l'orchestration agentique réelle.

---

## 2. Architecture du système RAG Agentique indépendant

```
                        ┌────────────────────────────────────┐
                        │     Frontend Next.js (existant)     │
                        │  Chat · Cours · Quiz · Dashboard    │
                        └───────────────┬────────────────────┘
                                        │ HTTPS
                        ┌───────────────▼────────────────────┐
                        │  API Routes Next.js (BFF)           │
                        │  Clerk auth → Zod → rate limit      │
                        └───────────────┬────────────────────┘
                                        │
              ┌─────────────────────────▼─────────────────────────┐
              │        ORCHESTRATEUR AGENTIQUE (LangGraph.js)      │
              │                                                    │
              │  ┌───────────┐   ┌────────────┐   ┌────────────┐  │
              │  │ Evaluateur │──▶│  Curateur  │──▶│   Mentor   │  │
              │  │ (existant) │   │  RAG réel  │   │ (existant) │  │
              │  └───────────┘   └─────┬──────┘   └─────┬──────┘  │
              │                        │                │         │
              │              ┌─────────▼───┐   ┌────────▼──────┐  │
              │              │  Retriever  │   │  Guardrails   │  │
              │              │  hybride    │   │  + validation │  │
              │              └─────────┬───┘   └───────────────┘  │
              └────────────────────────┼──────────────────────────┘
                                       │
        ┌──────────────────┬───────────┼─────────────┬──────────────────┐
        ▼                  ▼           ▼             ▼                  ▼
 ┌─────────────┐  ┌──────────────┐ ┌────────┐ ┌───────────┐  ┌────────────────┐
 │ BD vectoriel│  │ LLM Gateway  │ │ Cache  │ │  Outils   │  │  Observabilité │
 │  pgvector   │  │ GPT-4o-mini /│ │ Redis  │ │ Qualisoft │  │   Langfuse     │
 │ (Supabase)  │  │ Claude/Groq  │ │        │ │ API, SQL  │  │                │
 └──────▲──────┘  └──────────────┘ └────────┘ └───────────┘  └────────────────┘
       │
       │        ┌─────────────────────────────────────────┐
       └────────│      PIPELINE D'INGESTION (workers)      │
                │  PDF upload → pdf-parse → chunking       │
                │  → embeddings batch → upsert pgvector    │
                │  (queue BullMQ + Redis)                  │
                └─────────────────────────────────────────┘
```

### Flux requête (runtime)

1. Requête utilisateur → authentification Clerk → validation Zod → rate limit Redis.
2. **Evaluateur** analyse l'intention/niveau → génère le plan de recherche (multi-requêtes).
3. **Curateur RAG** : embedding de la requête → recherche pgvector (cosine, filtrée par matière/niveau via métadonnées) → **reranking** → top-k segments.
4. **Mentor** : prompt augmenté (contexte RAG + profil apprenant + lacunes) → LLM → réponse structurée JSON.
5. **Guardrails** : validation schéma de sortie, filtre de contenu, citation des sources.
6. Logging Langfuse (trace complète : retrieval, tokens, coût, latence).

### Flux ingestion (offline)

1. Upload PDF → Supabase Storage (existant).
2. Worker BullMQ : extraction texte (`pdf-parse`, fallback `pdfjs-dist`, OCR si scan).
3. Chunking récursif (~500 tokens, overlap 15 %) avec métadonnées `{subject, topic, difficulty, diploma_level, source}`.
4. Embeddings batch → upsert dans `course_content` (colonnes `embedding VECTOR(1536)` déjà prévues).

---

## 3. Logiciels par composant

| Composant | Recommandé | Alternative | Justification |
|---|---|---|---|
| **BD vectorielle** | **pgvector / Supabase** | Qdrant (self-hosted) | Déjà provisionné dans le schéma (`VECTOR(1536)`, index ivfflat). Une seule BDD pour données + vecteurs = jointures natives métadonnées. Migrer vers Qdrant seulement si > 1–2 M de chunks. |
| **Embeddings** | **OpenAI `text-embedding-3-small`** (1536 dims) | `bge-m3` / `multilingual-e5-large` (self-host via OVH AI Endpoints) | Dimensions compatibles avec le schéma existant. Option self-host si exigence de souveraineté des données. |
| **LLM principal** | **GPT-4o-mini** (coût) ou **Claude Sonnet** (qualité FR) | Mistral Large (hébergé UE, RGPD) | GPT-4o-mini : ~15× moins cher que GPT-4, suffisant pour quiz/explications. Mistral si données UE obligatoires. |
| **LLM rapide/bas coût** | **Groq `llama-3.3-70b`** | Mistral API | Déjà intégré (`app/api/ai/quiz`), latence < 1 s, idéal pour génération de quiz en masse. |
| **Orchestration agentique** | **LangGraph.js** (ou patterns agents custom, sans framework) | Vercel AI SDK | Graphe d'agents Evaluator→Curator→Mentor avec état partagé ; le SDK OpenAI actuel suffit aussi si on veut rester léger. |
| **Reranker** | **Cohere Rerank v3** | `bge-reranker-v2-m3` (self-host) | +10–20 % de précision retrieval pour quasi rien (~1 $/1000 recherches). |
| **Cache** | **Redis** (OVH Managed ou Upstash) | — | Cache embeddings + réponses fréquentes + rate limiting + queue. |
| **Queue/Workers** | **BullMQ** + Redis | Inngest / Trigger.dev | Ingestion PDF et embeddings en arrière-plan sans bloquer l'API. |
| **Parsing documents** | `pdf-parse` (existant) + `unstructured` | Docling | unstructured pour DOCX/PPTX/HTML si le corpus s'élargit. |
| **Guardrails / sécurité** | Validation **Zod** (existant) + **Llama Guard via Groq** + Supabase **RLS** (existant) | NeMo Guardrails | RLS déjà en place ; ajouter filtre injection-prompt + modération sortie. |
| **Observabilité LLM** | **Langfuse** (cloud EU ou self-host) | Helicone | Traces, coûts par user, évaluation qualité — indispensable pour un système agentique. |
| **Recherche hybride** | `tsvector` Postgres (full-text) + pgvector | Elastic/OpenSearch | BM25 natif Postgres suffit < 100 k documents ; combiner avec vectoriel = retrieval hybride. |

---

## 4. Configuration VPS OVH optimale (300–1000 utilisateurs)

### Option A — Recommandée : VPS + services managés (LLM en API)

Le LLM en API (OpenAI/Groq/Anthropic) supprime le besoin de GPU. Le VPS ne fait tourner que Next.js + workers + Redis.

| Rôle | Offre OVH | Specs | Prix indicatif |
|---|---|---|---|
| App Next.js + workers + Redis | **VPS Elite** (ou Comfort min.) | 8 vCores · 16–32 Go RAM · 160–400 Go NVMe | ~40–60 €/mois |
| BDD + vecteurs | **Supabase Pro** (managé, sauvegardes) | inclus pgvector | ~25 $/mois |
| Stockage fichiers | Supabase Storage (existant) | — | inclus |
| LLM | OpenAI / Groq / Anthropic API | — | ~50–300 €/mois selon usage (1000 users ≈ 5–15 M tokens/mois avec cache) |

**Total ≈ 100–400 €/mois.** Cache Redis agressif → divise les coûts LLM par 2–3 sur les questions récurrentes.

### Option B — Tout self-hosted (souveraineté maximale)

| Rôle | Offre OVH | Specs |
|---|---|---|
| App + Postgres/pgvector + Qdrant + Redis | **Serveur dédié Advance-1 / Rise-1** | 6–8 cœurs · 32 Go RAM · 2×512 Go NVMe (~60–80 €/mois) |
| LLM self-host (Llama 3.3 70B / Mistral) | **Instance GPU OVH** (L4 / L40S) ou OVH AI Endpoints | GPU 24–48 Go VRAM (~0,7–2 €/h → 500–1400 €/mois) |

⚠️ Le self-hosting LLM coûte 3–5× plus cher que l'API à cette échelle et ajoute de l'ops MLOps. **Déconseillé pour 300–1000 users** sauf obligation RGPD stricte — dans ce cas préférer **OVH AI Endpoints** (LLM managé, données en UE, facturé au token) : souveraineté sans gérer de GPU.

### Règles de dimensionnement

- 1000 utilisateurs **inscrits** ≈ 50–150 **concurrents** → 1 VPS 8 vCPU/16 Go tient largement (Next.js ~2–4 Go, workers ~2 Go, Redis ~1 Go, marge système).
- pgvector sur Supabase : jusqu'à ~500 k chunks sans tuning ; passer `ivfflat` → `hnsw` au-delà de ~50 k vecteurs pour de meilleures perfs.
- Prévoir un 2ᵉ VPS (replica) seulement à partir de ~3000 users ou si SLA exigé.

---

## 5. Intégration ERP Qualisoft

**Objectif :** les formations suivies dans Agentics remontent automatiquement dans Qualisoft (module Formation/Compétences).

### Implémentation : modèles QualiSoft natifs (Odoo 19)

QualiSoft v2 étant une suite Odoo, la synchro utilise l'**API JSON-2** (`POST {url}/json/2/<modèle>/<méthode>` + `Authorization: bearer <clé API>`) vers les **modèles natifs** — aucun module custom nécessaire :

| Objet Agentics | Objet QualiSoft | Méthode |
|---|---|---|
| Apprenant (email) | `res.partner` | `search_read` par email, `create` si absent |
| Cours (mapping `qualisoft_formation_code`) | `of.formation` (`code`) | `search_read` |
| — | `of.session` (`modalite='elearning'`, type `individuel`) | créée à la demande, 1 par formation |
| Complétion cours | `of.inscription` (`state='termine'`) | upsert par (stagiaire, session) |
| Score du quiz | `of.evaluation` (`type_evaluation='acquis_aval'`, `score`) | upsert, meilleur score conservé |

```
Agentics                                    QualiSoft/Odoo
┌─────────────────────┐   POST /json/2/    ┌──────────────────────────┐
│ quiz réussi ≥70%    │ ─────────────────▶ │ of.inscription (termine) │
│ → training_record   │   Bearer API key   │ of.evaluation (score)    │
│ → push + retry/cron │                    │ res.partner (apprenant)  │
└─────────────────────┘                    └──────────────────────────┘
```

1. **`training_records`** (Supabase, migration 014) : reçoit chaque complétion, persistée avant tout envoi → rien ne se perd si Odoo est indisponible.
2. **`lib/qualisoft.ts`** : push idempotent (inscription unique par apprenant/session), retries exponentiels + batch de reprise (`next_retry_at`), journal d'audit `qualisoft_sync_logs`.
3. **`app/api/qualisoft/sync`** : déclenché à la complétion (fire-and-forget) + batch via cron Bearer.
4. **`app/api/qualisoft/status`** : supervision admin (compteurs, cours sans mapping, derniers logs).
5. Fallback CSV (`QUALISOFT_MODE=csv`) si l'API n'est pas disponible.

---

## 6. Livraison du code (pour Claude — Projet Agentics)

Le code est exporté dans **`claude-project-export/`** — fichiers aplatis (`dossier__fichier.ext`) car les Claude Projects ne conservent pas l'arborescence. Uploader tout le dossier + le fichier `00-PROJECT-CONTEXT.md` qui décrit l'architecture, les variables d'environnement et la tâche Qualisoft.

### Prochaines étapes recommandées

1. Implémenter le pipeline d'ingestion (chunking + embeddings) — les colonnes vectorielles existent déjà.
2. Brancher le `CuratorAgent` sur pgvector (remplacer le mock par un vrai `match_documents` RPC).
3. Ajouter Langfuse + Redis cache.
4. Spécifier avec Qualisoft le format d'import (API ou CSV) avant de coder le connecteur.
