# Module Odoo : agentics_elearning_sync

Reçoit dans QualiSoft/Odoo les formations complétées sur la plateforme Agentics.

## Installation

1. Copier le dossier `agentics_elearning_sync/` dans les addons de l'instance
   (ex. `/opt/odoo19/addons-isbe/` ou équivalent) et l'ajouter à `--addons-path`
   si nécessaire.
2. Redémarrer Odoo, puis : Apps → *Update Apps List* → installer
   **« Agentics — Synchronisation des formations »**.
3. Un menu **Agentics → Formations remontées** apparaît dans l'interface.

## Utilisateur technique + clé API (requis pour la synchro)

1. Créer un utilisateur dédié, ex. `api-agentics@isbe.education`
   (Paramètres → Utilisateurs → Nouveau), type *Internal User*.
2. Lui donner accès en lecture/écriture à `of.elearning.record`
   (groupe *Internal User* suffit — voir `ir.model.access.csv`)
   et lecture sur `res.partner` (déjà couvert par Internal User).
3. Connecté avec cet utilisateur : Mon profil → onglet **Sécurité du compte** →
   **Nouvelle clé API**. Copier la clé (affichée une seule fois).
4. Côté serveur Agentics (VPS), définir :

   ```
   QUALISOFT_MODE=api
   QUALISOFT_API_URL=https://app.isbe.education
   QUALISOFT_DB=ISBE
   QUALISOFT_API_KEY=<la clé créée>
   QUALISOFT_CRON_SECRET=<32+ caractères aléatoires>
   ```

## Contrat d'API (côté Agentics : `lib/qualisoft.ts`)

| Champ Odoo | Rôle |
|---|---|
| `external_ref` | char, **unique** — id du training_record Supabase (idempotence) |
| `source` | char — toujours `agentics` |
| `partner_id` | m2o `res.partner` — apprenant trouvé par email |
| `learner_email` | char |
| `formation_code` | char — code formation QualiSoft |
| `course_title` | char |
| `score` | float 0–100 |
| `completed_at` | datetime UTC `YYYY-MM-DD HH:MM:SS` |
| `certificate_url` | char |

Endpoints utilisés : `POST /json/2/res.partner/search_read`,
`/json/2/of.elearning.record/search_read` puis `write` ou `create`.
En-têtes : `Authorization: bearer <clé>`, `X-Odoo-Database: ISBE`.

## Évolution possible

Rattacher `formation_code` au vrai modèle de formation QualiSoft (ex. un
many2one vers le catalogue `of.planning`/formation) une fois le nom du modèle
confirmé — ajouter alors un `onchange` ou un compute de rattachement.
