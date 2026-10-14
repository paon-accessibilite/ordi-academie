# Ordi Académie

## Version 0.2.0 Windows — à valider

49 missions, avec quatre nouveaux exercices de navigation regroupés dans le
badge **Premier bureau** : entrer dans Animaux, descendre dans Chats, remonter
au parent et retrouver la racine. La consigne et la validation sont renforcées.
Le badge en cours et son compteur restent visibles à gauche ; la réussite
d'une mission reste affichée même après un message d'action.

Chaque mission peut être relancée depuis le parcours, le bouton **Refaire cette
mission** ou le carnet. Elle prépare elle-même les fichiers ou documents requis.
Les réussites sont conservées. Les profils de la version 0.1 migrent par titres
de missions et gardent les badges déjà obtenus. Un nouveau badge ouvre un écran
de félicitations avec ses compétences ; **collecter** anime son icône vers
**Mes badges**. La préférence système de réduction des animations est respectée.

Tests : parcours et migration dans `npm test`, reprise des 49 missions et
géométrie des consignes/boutons dans le moteur Windows. En 1280 × 720, le bureau
occupe environ 941 × 506 px (73,5 % de la largeur, 70,3 % de la hauteur).
La version Linux et la publication de la v0.2 attendent la validation utilisateur.

**Version Windows 0.1.0 disponible avec installeur.** [Télécharger](https://github.com/paon-accessibilite/ordi-academie/releases/tag/v0.1.0) · [Instructions Windows](INSTALLATION-WINDOWS.md)

**Version Linux Mint 22.3 Xfce (amd64).** Paquet `.deb` avec moteur d'affichage et
voix française hors ligne embarqués. [Instructions Linux](INSTALLATION-LINUX.md).
La chaîne GitHub Actions compile sous Ubuntu 24.04 et vérifie l'installation,
deux lancements avec reprise des profils et la désinstallation dans un système
Xfce isolé sans réseau. Ce test ne remplace pas un essai sur un PC Mint physique.

Prototype pédagogique autonome en français, sans installation ni connexion.

Ouvrir `index.html` dans Firefox, Chrome ou Edge sous Windows ou Linux. Les 49 missions enseignent les gestes souris, la gestion des fichiers et dossiers, les chemins, les fenêtres et le traitement de texte. Un écran de connexion permet de créer et choisir un profil élève. Le bureau, les documents, les brouillons et le carnet de réussites sont conservés localement pour chaque profil quand le stockage du navigateur est disponible.

Le bouton 🔊 à côté de la consigne, du coup de pouce ou de la demande de saisie lit son texte. Un second clic arrête la lecture, ainsi que le changement de mission. La synthèse vocale du navigateur privilégie une voix française locale lorsqu'elle est disponible. La disponibilité des voix et leur fonctionnement hors connexion dépendent du navigateur et du système ; un message apparaît si la lecture ne peut pas démarrer. Aucun service audio externe ni clé API n'est configuré dans ce projet.

Les noms attendus dans les missions sont acceptés sans tenir compte des majuscules et minuscules : `animaux`, `Animaux` et `ANIMAUX` valident la même consigne. La casse saisie par l'élève reste affichée. Les doublons de noms sont également détectés sans tenir compte de la casse.

Dans la fenêtre Mes images, faire un clic droit dans un espace vide pour accéder à **Nouveau dossier**, ou sur un fichier/dossier pour accéder à **Renommer**. Le clic droit sélectionne automatiquement l'élément visé. Cliquer ailleurs ou appuyer sur Échap ferme le menu. Les boutons de la barre d'outils restent disponibles comme aide. Les missions 11 et 12 proposent maintenant ce geste.

Les menus contextuels proposent aussi Copier, Coller, Déplacer, Supprimer et Restaurer selon l'élément visé. La copie conserve l'original ; le déplacement d'un dossier conserve son contenu ; la corbeille permet de revenir sur une suppression. Les raccourcis Ctrl+C, Ctrl+X, Ctrl+V, F2 et Suppr sont disponibles dans la fenêtre de fichiers.

## Défis chemins (missions 19 à 24)

Accès direct avec **Défis chemins**. Chaque défi repart d'une arborescence d'entraînement indépendante. Les dossiers et fichiers peuvent s'ouvrir par **double-clic** ou **clic puis Entrée**, y compris les icônes du bureau et la corbeille. Le fil de navigation est cliquable pour remonter dans les dossiers.

- Trouver le bon `Observation` parmi deux fichiers de même nom, dans des branches différentes.
- Sélectionner le fichier puis choisir parmi trois propositions le chemin complet de `Renard`.
- Déplacer un fichier dans le dossier indiqué par son chemin.
- Copier vers `Archives / 2026` en conservant le bon original.
- Créer `Sortie / Photos` dans la bonne branche, puis y placer un fichier.
- Ranger trois fichiers dans trois destinations différentes.

Le chemin est reconnu à partir du fil de navigation, sans saisie manuelle. Les noms de même type dans deux branches différentes sont distingués par leur emplacement.

## Atelier souris (missions 1 à 4)

Inspiré des gestes travaillés dans le projet local Clicker / Mouse Academy : clic gauche, clic droit, double-clic et glisser-déposer. L'atelier propose des cibles successives, sans chronomètre ni perte de points. Trois tailles de cibles et trois délais de double-clic sont disponibles. Le délai concerne uniquement le jeu souris : l'ouverture par double-clic des dossiers garde le comportement du navigateur, avec l'alternative clic puis Entrée.

## Badges et repères enseignant

**Mes badges** affiche dix badges : Premier bureau, Organisateur, Explorateur des chemins, Souris agile, Maître des fenêtres , Auteur en herbe, Clavier apprivoisé, Presse-papiers malin et Raccourcis maîtrisés. Chaque badge exige la réussite de toutes les missions de son groupe. L'accès direct à un atelier ne valide pas les missions sautées.

Le carnet fournit une date de réussite, les consultations du coup de pouce et les validations/gestes à corriger, pour chaque mission réussie. La synthèse vocale est une aide d'accès aux consignes et n'est pas comptée comme consultation du coup de pouce. Le carnet peut être imprimé et est conservé après **Recommencer** ou rechargement, si le stockage local est disponible. Chaque élève possède désormais son carnet personnel : changer de profil garde les réussites séparées. Un fichier ouvert directement et la version servie en HTTP peuvent avoir des carnets distincts.

Les badges indiquent des exercices réussis dans le simulateur. Ils servent de repère pour poursuivre la pratique sur un vrai ordinateur.

Vérifications automatiques : `node verify.cjs` (49 missions, menus contextuels, déplacements, copies, homonymes et chemins incorrects, clic puis Entrée, corbeille, casse, gestes souris, obtention et rechargement des badges, synthèse vocale simulée). Ce test ne confirme pas le son effectivement joué sur l'ordinateur.

Les profils sont locaux et ne sont pas synchronisés entre les ordinateurs. Il n’y a pas de tableau de bord centralisé. Les gestes doivent ensuite être pratiqués sur un vrai bureau avec l'accompagnement d'un adulte.

Pour un aperçu HTTP : `python -m http.server 8080 --bind 127.0.0.1` puis ouvrir http://127.0.0.1:8080.

## Manipuler les fenêtres (missions 25 à 28)

Après la souris (1–4), les fichiers et dossiers (5–18) et les chemins (19–24), quatre missions enseignent Réduire, retrouver avec la barre des tâches, Agrandir puis restaurer la taille normale, et Fermer. Le badge **Maître des fenêtres** exige ces quatre réussites. **Atelier fenêtres** permet un accès direct.

L’explorateur et TAda disposent des mêmes trois boutons dans leur barre de titre. Agrandir remplit uniquement le bureau simulé. Réduire conserve la fenêtre ouverte et le texte non enregistré ; cliquer sur son bouton dans la barre des tâches la restaure. Fermer retire son bouton de la barre. Les fenêtres peuvent passer devant l’autre en cliquant dessus. Le carnet retrouve les réussites par leur titre malgré le nouvel ordre des missions.

## Atelier documents (missions 33 à 36)

L’éditeur TAda simplifié s’ouvre dans une fenêtre à l’intérieur du bureau simulé, avec réduction, agrandissement et fermeture. Le raccourci **TAda** s’ouvre par double-clic ou clic puis Entrée. **Atelier documents** lance les quatre missions : créer un document et saisir une courte invitation libre ; nommer Invitation ; enregistrer dans Mes images / Classe / Invitations ; fermer TAda, retrouver Invitation et le rouvrir. Le badge **Auteur en herbe** exige les quatre réussites.

Nouveau, Ouvrir et Enregistrer utilisent la même arborescence que l’explorateur. Les listes affichent les chemins complets pour distinguer les dossiers homonymes. Le fichier enregistré peut être déplacé, renommé, copié, supprimé et restauré ; son texte accompagne ces opérations. Les doublons sont refusés sans tenir compte de la casse. Un avertissement protège les modifications non enregistrées quand on quitte le document. Lire mon texte utilise la synthèse vocale existante.

Le bureau et les brouillons sont sauvegardés pour le profil lorsque la session se ferme ou que la page se recharge. Recommencer réinitialise les exercices et les fichiers du profil, tout en conservant ses badges. Aucun fichier réel n’est écrit sur le disque. L’interface s’inspire de TAda, sans modifier le projet TAda ni intégrer les formats TAD/DOCX. La mise en forme viendra ensuite.

Le fichier document-preview.html reste une ancienne maquette indépendante ; l’atelier intégré se trouve dans index.html. Les anciens modèles clavier sont conservés dans future/keyboard-exercises.json comme archive de la première progression.

## Écrire dans TAda (missions 37 à 41)

Chaque mission ouvre un document d’entraînement dans la même fenêtre TAda. L’élève travaille les espaces, les majuscules, les accents, Retour arrière puis Suppr. Le modèle reste visible et Vérifier valide le texte. Réessayer restaure le texte initial. Les espaces, la casse et les accents sont vérifiés précisément dans ces exercices ; les noms de fichiers restent insensibles à la casse. Les accents Unicode équivalents sont acceptés. Les exercices Retour arrière et Suppr exigent une suppression effective avec la bonne touche, sans sélection.

## Copier, couper et coller (missions 42 à 44)

La barre de TAda propose Copier, Couper, Coller et Annuler. Trois missions distinguent une copie qui conserve l’original, un collage qui duplique le mot et un déplacement par couper/coller. La sélection peut se faire à la souris ou au clavier. Les commandes utilisent un presse-papiers de texte interne à TAda, indépendant du presse-papiers des fichiers et de celui du système. Il reste disponible entre les documents pendant la visite ; chaque mission commence avec un presse-papiers vide. Annuler revient sur les modifications de la feuille, avec un historique de 100 changements par document.

## Raccourcis avancés (missions 45 à 49)

Accès direct avec Raccourcis avancés. Les missions enseignent Ctrl+A, Ctrl+C / Ctrl+V, Ctrl+X / Ctrl+V, Ctrl+Z et Ctrl+S. Les commandes des boutons restent disponibles comme aide, mais ces missions exigent les raccourcis demandés. Ctrl+S ouvre la boîte d’enregistrement de TAda et doit réellement enregistrer le bon texte dans le bon dossier. Les raccourcis sont interceptés dans la feuille TAda ; Ctrl+S fonctionne aussi depuis son champ de nom. Les autres champs et le reste de la page gardent leur comportement normal.

## Noms visibles et icônes

Les documents texte portent une icône bleue avec le T de TAda et s’ouvrent dans TAda. Les extensions connues sont masquées dans l’explorateur, les listes Ouvrir, les chemins affichés, les consignes et le champ Renommer. Elles restent conservées dans les données : renommer Invitation en Fête conserve .txt ; une copie devient Invitation (copie 1), sans exposer l’extension.

## Presse-papiers du bureau (missions 29 à 32)

Avant TAda, quatre missions enseignent Copier un fichier, Coller sa copie dans Classe, Couper/coller un fichier et Couper/coller un dossier avec son contenu. Accès direct : Copier et déplacer des fichiers. Les boutons et menus contextuels proposent Couper ; Ctrl+X est disponible dans l’explorateur. Un élément coupé devient pâle, reste dans son dossier jusqu’au collage, puis est déplacé sans duplication. Un collage dans le même dossier ou dans un descendant est refusé ; le presse-papiers reste disponible pour corriger la destination. Le badge Fichiers bien rangés exige les quatre réussites.

TAda utilise maintenant une interface compacte sans panneau défilant : commandes en haut, champ Nom, modèle lorsqu’un défi le demande et petite zone d’écriture. Vérifier et Réessayer restent dans la barre du haut. Le texte long peut déplacer le curseur dans la zone d’écriture, sans afficher de barre de défilement ; les exercices proposés restent courts. Les fonctionnalités existantes, la lecture vocale et les boutons des fenêtres sont conservés.

## Connexion et profils élèves

L’accueil imite une connexion à un ordinateur : créer un profil avec un prénom ou un pseudo et un avatar, sélectionner ce profil puis cliquer sur Se connecter. Le bureau affiche l’élève connecté ; Changer d’élève enregistre sa session et revient à l’accueil. Chaque profil conserve ses réussites, son bureau et son brouillon TAda, y compris après rechargement. Les prénoms identiques sans distinction de casse sont refusés : ajouter une initiale permet de distinguer deux élèves.

Les profils sont des identités pédagogiques du simulateur, sans mot de passe ni compte du système Windows/Linux. Ils ne protègent pas l’accès entre élèves : chacun peut sélectionner n’importe quel profil local. Aucune donnée n’est envoyée à un serveur. Les fichiers ouverts directement et les versions HTTP utilisent éventuellement des stockages distincts. Si la sauvegarde est indisponible, les profils restent séparés dans la session courante et un message le signale.

L’ancien carnet partagé est conservé dans un profil distinct Ancien carnet ; ses réussites ne sont pas attribuées aux nouveaux élèves. La clé de stockage historique reste intacte.

## Affichage plein écran et 720p

Le bouton Plein écran est disponible sur l’accueil et dans le bandeau du bureau. Échap permet de sortir du plein écran ; F11 reste utilisable dans un navigateur classique si le plein écran est refusé par un navigateur intégré.

En 1280 × 720, le bandeau mesure 44 px et la consigne occupe 140 px. Le bureau en bas à droite mesure environ 941 × 506 px, soit 73,5 % de la largeur et 70,3 % de la hauteur de l’écran. La validation, l’aide et Mission suivante sont regroupées dans la zone de consigne. Les missions sont affichées cinq par page dans la colonne gauche. Les choix de chemin restent visibles dans le bureau au-dessus de l’explorateur. TAda ne comporte aucun panneau défilant.

Les profils sont paginés par quatre ; le carnet affiche les dix badges ou les repères enseignant par pages de huit missions. L’impression conserve le rapport complet. Ces paginations évitent les barres de défilement pour les contenus pédagogiques du parcours sur un écran 720p. Les tailles inférieures à 1000 × 600 conservent l’affichage responsive précédent.

## Application Windows

Le dossier src-tauri contient l’enveloppe native Tauri. L’interface est embarquée, sans serveur local à démarrer. L’application démarre en plein écran ; son bouton et Échap utilisent la fenêtre native. L’installeur NSIS en français embarque WebView2 et s’installe pour l’utilisateur courant.

Construction : npm ci --ignore-scripts, npm test, puis npm run windows:build -- -- --locked. Le script scripts/smoke-windows.ps1 vérifie l’exécutable dans WebView2 avec une fenêtre cachée et un stockage de test isolé. Le workflow GitHub Application Windows produit aussi l’installeur et son artifact. Les données des élèves, caches et sorties de compilation sont exclus du dépôt.
