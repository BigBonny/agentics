# Guide Complet pour Tester les Fonctionnalités des Cours

## Comment Tester l'Ajout de Cours

### 1. Compte Administrateur Requis

**IMPORTANT**: Seul vous (l'administrateur) pouvez ajouter des cours.

**Votre ID d'administrateur**: `user_3BCVh2jkLqNoCZbFCLI0kfK8Dol`

### 2. Méthodes pour Ajouter des Cours

#### Méthode A: Upload de PDF (Recommandé)
1. **Connectez-vous** avec votre compte administrateur
2. **Allez à**: `http://localhost:3000/admin/courses`
3. **Cliquez sur**: "Téléverser en lot"
4. **Sélectionnez**: Vos fichiers PDF (vos livres scannés)
5. **Personnalisez**: Métadonnées (titre, description, niveau, etc.)
6. **Cliquez sur**: "Téléverser X cours"

#### Méthode B: Création Manuelle
1. **Connectez-vous** avec votre compte administrateur
2. **Allez à**: `http://localhost:3000/admin/create-course`
3. **Remplissez**: Le formulaire avec les détails du cours
4. **Cliquez sur**: "Créer le cours"

### 3. Vérification du Système

#### Étape 1: Vérifier le Bucket Storage
1. **Allez à**: Supabase Dashboard
2. **Navigation**: Storage
3. **Vérifiez**: Bucket `course-images` existe
4. **Contenu**: Vos fichiers PDF doivent apparaître

#### Étape 2: Vérifier la Base de Données
1. **Allez à**: Supabase Dashboard
2. **Navigation**: Table Editor
3. **Table**: `courses`
4. **Vérifiez**: Vos cours apparaissent avec tous les champs

#### Étape 3: Vérifier l'Interface Admin
1. **Allez à**: `http://localhost:3000/admin/courses`
2. **Devriez voir**: Vos cours uploadés
3. **Fonctionnalités**: Recherche, filtres, suppression

### 4. Test Complet du Flux

#### Flux d'Upload PDF:
```
PDF Upload -> Storage Bucket -> Course Record -> AI Extraction -> Admin Interface
```

#### Flux de Création Manuelle:
```
Formulaire -> Base de Données -> Admin Interface -> Publication
```

### 5. Dépannage

#### Si l'Upload ne Fonctionne Pas:
1. **Vérifiez**: Bucket `course-images` existe dans Supabase Storage
2. **Vérifiez**: RLS policies sont permissives
3. **Vérifiez**: Taille maximale des fichiers (50MB)
4. **Console**: Messages d'erreur dans le navigateur

#### Si les Cours n'Apparaissent Pas:
1. **Vérifiez**: `is_published` est `true` ou `false`
2. **Vérifiez**: Admin ID dans `created_by`
3. **Vérifiez**: RLS policies sur table `courses`

#### Si l'IA ne Traite Pas:
1. **Vérifiez**: API `/api/ai/extract-content` fonctionne
2. **Vérifiez**: OpenAI API key dans `.env.local`
3. **Console**: Messages d'extraction IA

### 6. Permissions et Sécurité

#### Admin Only:
- **Seulement vous** pouvez créer/éditer/supprimer des cours
- **Autres utilisateurs** ne peuvent que voir les cours publiés

#### RLS Policies:
- **Admin**: Accès complet à tous les cours
- **Utilisateurs**: Voir seulement les cours publiés
- **Invités**: Voir preview limitée

### 7. Test des Fonctionnalités Avancées

#### Test d'Extraction IA:
1. **Upload** un PDF avec du texte clair
2. **Attendez** 1-2 minutes
3. **Vérifiez**: `extraction_status` devient "completed"
4. **Vérifiez**: Métadonnées enrichies

#### Test de Publication:
1. **Créez** un cours avec `is_published: false`
2. **Vérifiez**: N'apparaît pas pour les utilisateurs
3. **Changez** à `is_published: true`
4. **Vérifiez**: Apparaît pour les utilisateurs

### 8. URL de Test

#### Pages Administrateur:
- `http://localhost:3000/admin/courses` - Gestion des cours
- `http://localhost:3000/admin/create-course` - Création manuelle
- `http://localhost:3000/admin` - Dashboard admin

#### Pages Utilisateurs:
- `http://localhost:3000/courses` - Bibliothèque de cours
- `http://localhost:3000/quiz/guest` - Quiz pour invités

### 9. Checklist de Test

- [ ] Connexion avec compte admin
- [ ] Upload de PDF fonctionne
- [ ] Création manuelle fonctionne
- [ ] Cours apparaissent dans interface admin
- [ ] IA extraction fonctionne
- [ ] Publication/dépublication fonctionne
- [ ] RLS policies respectées
- [ ] Invités voient preview limitée
- [ ] Abonnés voient bibliothèque complète

### 10. Support

**Si quelque chose ne fonctionne pas:**
1. **Console du navigateur**: Messages d'erreur
2. **Terminal**: Logs du serveur
3. **Supabase**: Vérifier tables et buckets
4. **Environment**: Vérifier `.env.local`

**Votre système est prêt pour les tests!**
