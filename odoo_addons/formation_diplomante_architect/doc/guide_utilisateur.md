# Guide utilisateur — Formations diplômantes

## 1. Créer un diplôme et importer son référentiel

1. Menu **Formations diplômantes → Diplômes → Nouveau**.
2. Saisir l'intitulé et le **code RNCP** (ex. `RNCP35185`), puis enregistrer.
3. Cliquer **Importer depuis le RNCP**. Chaque bloc de compétences du
   référentiel devient une **matière**, rangée dans « Année 1 / Semestre 1 »
   si la structure est encore vide.
4. Si l'API RNCP n'est pas configurée ou ne répond pas : cliquer **Saisir les
   blocs manuellement** et coller un bloc par ligne, par exemple :

   ```
   RNCP35185BC01 | Support et mise à disposition de services informatiques
   RNCP35185BC03 | Cybersécurité des services informatiques | Protéger les données…
   ```

5. Onglet **Structure** : ajouter les années et semestres réels. Ouvrir une
   matière pour changer son semestre, son coefficient et son volume horaire.

## 2. Découper en micro-compétences avec l'IA

1. Ouvrir une **matière** (ou un **chapitre** pour un découpage plus fin).
2. Vérifier que le texte du bloc est renseigné : c'est ce que l'IA lit.
3. Cliquer **Générer les micro-compétences** et confirmer.
4. La liste des micro-compétences créées s'affiche, toutes en **Brouillon**.

Relancer la génération n'ajoute que les micro-compétences dont l'intitulé
n'existe pas déjà dans le chapitre.

Pour ajuster les consignes données à l'IA : onglet **Assistant IA** du
diplôme, champ « Prompt système personnalisé ». Le même onglet affiche le
nombre d'appels effectués et le quota du diplôme.

## 3. Valider les micro-compétences (responsable)

Une micro-compétence n'est transmise à Qualisoft et aux agents que si elle est
**validée par un humain**.

1. Menu **Micro-compétences** : le filtre « À valider » est actif par défaut.
2. Relire et corriger l'intitulé (verbe d'action, objet, condition), la
   description et le niveau.
3. Cliquer **Valider** ou **Rejeter** — sur la fiche, ou sur plusieurs lignes
   cochées dans la liste.

Seuls les responsables voient ces boutons.

## 4. Définir les méthodes d'évaluation

Sur la fiche d'une micro-compétence, onglet **Méthodes d'évaluation** :
ajouter une ligne par méthode (QCM, exercice pratique, étude de cas, oral,
projet) avec son critère de réussite, sa durée estimée et sa pondération.
Le bouton **Dupliquer** copie une méthode pour l'adapter.

## 5. Attacher des ressources documentaires

Onglet **Ressources documentaires** de la micro-compétence :

* **Document** : déposer un fichier (PDF, DOCX…) ;
* **Lien** ou **Vidéo** : coller l'URL ;
* ajouter des **tags** pour faciliter la recherche.

Le statut **Indexation RAG** indique si la base vectorielle a déjà pris en
compte la ressource. Il repasse à « Non indexé » quand le fichier ou l'URL
change.

## 6. Valider le diplôme

Quand la structure est prête, un responsable clique **Valider le diplôme**.
Le statut est visible par Qualisoft via l'API.
