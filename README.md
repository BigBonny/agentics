# Agentics Révision

Plateforme d'apprentissage personnalisé utilisant l'intelligence artificielle pour aider les étudiants à réussir leurs examens nationaux.

## Description

Agentics Révision est une solution éducative innovante qui s'adresse aux problèmes persistants dans l'enseignement traditionnel : les programmes de cours proposés à des groupes d'apprenants hétérogènes n'adaptent pas leur contenu aux profils individuels, aux connaissances spécifiques ni aux centres d'intérêt de chaque étudiant.

Notre plateforme utilise une architecture basée sur trois agents intelligents qui travaillent en synergie pour offrir un apprentissage véritablement personnalisé.

## Architecture

### Agent Évaluateur
- Analyse les documents des apprenants et leurs réponses
- Détecte les lacunes conceptuelles et les biais cognitifs
- Propose des évaluations adaptées

### Agent Curateur (RAG)
- Interroge la base de connaissances vectorielle
- Extrait uniquement les segments de cours pertinents
- Assure la conformité avec les examens nationaux

### Agent Mentor
- Synthétise des explications pédagogiques personnalisées
- Adapte le ton, la complexité et les exemples
- Génère des exercices de remédiation adaptés

## Fonctionnalités

- 🎯 **Contenu Adaptatif**: Analyse du niveau et adaptation du contenu en temps réel
- 📊 **Suivi de Progrès**: Statistiques détaillées et recommandations personnalisées
- ⏰ **Apprentissage Flexible**: Accès 24/7, étude à votre rythme
- 🤝 **Support Personnalisé**: Accompagnement par agents intelligents
- 📝 **Examens Blancs**: Simulations des conditions réelles d'examen
- ✅ **Validation des Acquis**: Tests réguliers et progression structurée

## Tarifs

### Étudiants Individuels
- **12€/mois** ou **100€/an**
- Accès illimité à toutes les fonctionnalités
- Essai gratuit de 14 jours

### Centres de Formation
- **Sur mesure** avec 20-30% de réduction sur les abonnements annuels
- Gestion multi-apprenants
- Tableau de bord administratif
- Support prioritaire

## Technologies

- **Next.js 14** - Framework React moderne
- **TypeScript** - Type safety et meilleure expérience développeur
- **Tailwind CSS** - Styling utilitaire-first
- **Lucide React** - Icônes modernes et cohérentes

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Démarrer le serveur de production
npm start
```

## Structure du Projet

```
agentics-revision/
├── app/                    # App Router Next.js
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/             # Composants React
│   ├── Header.tsx         # Navigation
│   ├── Hero.tsx           # Section hero
│   ├── Architecture.tsx   # Architecture Agentics
│   ├── Features.tsx       # Fonctionnalités
│   ├── Pricing.tsx        # Tarifs
│   ├── Contact.tsx        # Contact
│   └── Footer.tsx         # Pied de page
├── public/                # Assets statiques
├── package.json           # Dépendances et scripts
├── tailwind.config.js     # Configuration Tailwind
├── postcss.config.js      # Configuration PostCSS
└── next.config.js         # Configuration Next.js
```

## Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact

- **Email**: contact@agentics-revision.fr
- **Téléphone**: +33 1 23 45 67 89
- **Adresse**: 123 Avenue de l'Innovation, 75001 Paris, France

---

© 2024 Agentics Révision. Tous droits réservés.
