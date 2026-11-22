# Module Odoo : formation_diplomante_architect

Conception et découpage de formations diplômantes : du référentiel officiel
(RNCP / France Compétences) jusqu'aux micro-compétences évaluables, avec leurs
méthodes d'évaluation et leurs ressources documentaires. Les données sont
exposées en JSON pour Qualisoft et pour l'indexation RAG.

Ce module **définit** les données. Les moteurs d'évaluation adaptative et de
remédiation (agents) sont hors périmètre.

## État de validation

| Élément | État |
|---|---|
| Syntaxe Python et XML | vérifiée |
| Fonctions de lecture des réponses IA / RNCP (`utils/parsing.py`) | testées hors Odoo (`python tests/test_parsing.py`) |
| Installation sur Odoo 19.0 (instance locale, base vierge + données de démo) | faite — 10 tests `tests/test_formation.py` réussis, écrans et API REST vérifiés |
| Appel réel à un fournisseur LLM | **non testé** (aucune clé) — les tests simulent la réponse |
| Odoo 20.0 | **non testé** — voir « Compatibilité » |
| Import RNCP contre une vraie API | **non testé** — le format dépend de l'API retenue |

## Installation

1. Copier le dossier `formation_diplomante_architect/` dans les addons de
   l'instance et l'ajouter à `--addons-path` si nécessaire.
2. Dépendance Python : `requests` (déjà présente dans une installation Odoo standard).
3. Redémarrer Odoo, puis Apps → *Mettre à jour la liste* → installer
   **« Formation Diplomante Architect »**.
4. Le menu **Formations diplômantes** apparaît. Avec les données de
   démonstration, un BTS SIO d'exemple est créé.

Lancer les tests :

```
odoo-bin -d <base_de_test> -i formation_diplomante_architect --test-tags /formation_diplomante_architect --stop-after-init
```

## Configuration

Paramètres → **Formation Architect** (administrateur). Chaque valeur est un
paramètre système (`ir.config_parameter`) :

| Réglage | Clé | Rôle |
|---|---|---|
| Fournisseur LLM | `formation_diplomante_architect.llm_provider` | `openai`, `mistral` ou `anthropic` |
| Clé API LLM | `formation_diplomante_architect.llm_api_key` | clé du fournisseur |
| Modèle LLM | `formation_diplomante_architect.llm_model` | vide = modèle économique par défaut |
| Quota par diplôme | `formation_diplomante_architect.llm_quota_defaut` | seuil d'avertissement, 0 = aucun |
| Endpoint RNCP | `formation_diplomante_architect.rncp_endpoint` | URL, `{code}` remplacé par le code RNCP |
| Clé API RNCP | `formation_diplomante_architect.rncp_api_key` | envoyée en `Authorization: Bearer` |
| Clé API Qualisoft | `formation_diplomante_architect.qualisoft_api_key` | jeton exigé par l'API REST |

Paramètre avancé (non affiché) : `formation_diplomante_architect.llm_base_url`
pour pointer vers un service compatible (proxy, hébergement privé).

## Groupes

| Groupe | Droits |
|---|---|
| `group_formation_architect_user` (Utilisateur) | crée et modifie diplômes, structure, micro-compétences, évaluations, ressources ; lance l'IA |
| `group_formation_architect_manager` (Responsable) | en plus : valide / rejette les micro-compétences, valide un diplôme, supprime un diplôme |

Les administrateurs Odoo sont responsables d'office et sont les seuls à voir
l'écran Paramètres (clés API). En multi-société, chacun ne voit que les
diplômes de ses sociétés.

## Schéma de données

```
formation.diplome
 └─ formation.annee                (diplome_id)
     └─ formation.semestre         (annee_id)
         └─ formation.matiere      (semestre_id)   = bloc de compétences
             └─ formation.chapitre (matiere_id)
                 └─ formation.micro_competence (chapitre_id)
                     ├─ formation.methode_evaluation (micro_competence_id)
                     └─ formation.ressource          (micro_competence_id) ── formation.ressource.tag (M2M)
```

| Modèle | Champs principaux |
|---|---|
| `formation.diplome` | `name`, `code_rncp`, `code_cfd`, `niveau_europeen` (1–8), `certificateur`, `statut` (brouillon/valide), `source` (rncp/manuel), `company_id`, `llm_call_count`, `llm_call_quota`, `prompt_systeme` |
| `formation.annee` | `name`, `sequence`, `diplome_id` |
| `formation.semestre` | `name`, `sequence`, `annee_id` |
| `formation.matiere` | `name`, `code_bloc`, `semestre_id`, `coefficient`, `volume_horaire`, `description` (texte du bloc) |
| `formation.chapitre` | `name`, `ordre`, `matiere_id`, `description` |
| `formation.micro_competence` | `name`, `description`, `niveau` (debutant/intermediaire/avance), `statut_validation` (brouillon/valide/rejete), `chapitre_id`, `generee_par_ia`, `valide_par_id`, `date_validation` |
| `formation.methode_evaluation` | `type` (qcm/exercice/etude_cas/oral/projet), `critere_reussite`, `duree_estimee` (min), `ponderation` |
| `formation.ressource` | `name`, `type` (document/lien/video), `fichier`, `fichier_nom`, `url`, `description`, `tag_ids`, `statut_indexation` (non_indexe/indexe) |

Chaque niveau porte aussi `diplome_id` et `company_id` (champs liés stockés)
pour le filtrage et les règles multi-société.

## Import du référentiel

* **API RNCP** : bouton « Importer depuis le RNCP » sur le diplôme. Le module
  appelle l'endpoint configuré et cherche dans la réponse JSON une liste de
  blocs (objets portant `intitule` / `libelle`, de préférence sous une clé
  contenant « bloc »). Chaque bloc devient une matière.
* **Saisie manuelle** (repli) : bouton « Saisir les blocs manuellement », un
  bloc par ligne (`CODE | Intitulé | Description`).

Aucun doublon n'est créé si l'import est relancé (comparaison sur le code du
bloc puis sur l'intitulé).

## Assistant IA

Bouton « Générer les micro-compétences » sur une matière ou un chapitre.

* Le texte envoyé est l'intitulé + la description du bloc (ou du chapitre).
* Le prompt système par défaut est celui du cahier des charges ; il peut être
  remplacé diplôme par diplôme (onglet « Assistant IA »).
* Les micro-compétences sont créées en **Brouillon**. Seul un responsable peut
  les passer à « Validé par humain » ou « Rejeté ».
* Chaque appel est compté sur le diplôme. Quand le quota est atteint, un
  bandeau et un message dans le fil de discussion préviennent ; la génération
  reste possible.

## API REST

Authentification : en-tête `Authorization: Bearer <clé>` ou `X-API-Key: <clé>`.
Sans clé configurée dans Odoo, l'API répond 503. Réponses en JSON.

| Méthode | Endpoint | Rôle |
|---|---|---|
| GET | `/api/v1/diplomes` | liste des diplômes ; filtres `?statut=valide`, `?code_rncp=RNCP35185` |
| GET | `/api/v1/diplomes/{id}/structure` | arborescence complète Années > Semestres > Matières > Chapitres > Micro-compétences |
| GET | `/api/v1/micro-competences/{id}` | détail, méthodes d'évaluation et ressources |
| GET | `/api/v1/ressources` | ressources pour le RAG ; filtres `?statut_indexation=non_indexe`, `?diplome_id=` |
| GET | `/api/v1/ressources/{id}/fichier` | téléchargement du fichier d'une ressource |
| POST | `/api/v1/ressources/{id}/indexation` | marque la ressource indexée (`statut=non_indexe` pour l'inverse) |

Par défaut seules les micro-compétences **validées par un humain** sont
renvoyées. Ajouter `?inclure_non_validees=1` pour tout obtenir.

```
curl -H "Authorization: Bearer $CLE" https://odoo.exemple.fr/api/v1/diplomes/1/structure
```

Cette interface est générique : elle devra être ajustée quand l'éditeur de
Qualisoft aura fourni ses spécifications (endpoints attendus, format,
authentification).

## Compatibilité Odoo 19.0 / 20.0

Le module est écrit pour Odoo 19.0 (`version: 19.0.1.0.0`) et n'utilise que des
API courantes. Points propres aux versions récentes, à contrôler lors du
portage 20.0 :

| Composant | Choix dans le module | À vérifier en 20.0 |
|---|---|---|
| Vues liste | balise `<list>` | — |
| Conditions d'affichage | attributs `invisible=` / `required=` en expression Python | — |
| Fil de discussion | `<chatter/>` | — |
| Contraintes SQL | `models.Constraint` | — |
| Groupes | `res.groups.privilege` + `privilege_id` | nom du modèle et du champ |
| Écran Paramètres | `<app>` / `<block>` / `<setting>` | — |
| Contrôleurs | `@http.route(type='http')`, `request.make_json_response` | — |
| Tests | `TransactionCase`, `new_test_user` | — |

Pour la livraison en deux branches (`19.0` et `20.0`) : créer la branche `20.0`
à partir de `19.0`, passer la version du manifest à `20.0.1.0.0`, puis lancer
les tests sur une instance 20.0.

## Guide utilisateur

Voir [doc/guide_utilisateur.md](doc/guide_utilisateur.md).
