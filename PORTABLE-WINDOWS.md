# Ordi Academie 0.3.1 — Windows sans installation

Pour Windows 10 ou 11, en 64 bits (x64).

1. Télécharger `Ordi-Academie-0.3.1-windows-x64-portable.zip`.
2. Faire un clic droit sur le ZIP, puis **Extraire tout** dans un dossier local.
3. Dans le dossier extrait, ouvrir **Ordi Academie.exe**.

Extraire le dossier entier : ne pas ouvrir l'application directement dans le ZIP.
Conserver le sous-dossier **WebView2** à côté de l'exécutable. Son moteur est
embarqué : aucun installeur, téléchargement complémentaire ou droit
administrateur n'est nécessaire. Une clé USB convient ; les chemins réseau
ne sont pas pris en charge par ce moteur.

Les exercices fonctionnent sans connexion. La lecture utilise les voix locales
de Windows ; une voix française doit être disponible sur le poste.

Les profils et badges sont enregistrés dans le compte Windows courant,
au même endroit que pour la version installée. Ils ne voyagent pas sur la
clé USB. Déplacer ou supprimer le dossier de l'application ne les efface pas.
Fermer l'autre version d'Ordi Academie avant de lancer celle-ci.

L'application démarre en plein écran. **Échap** revient au mode fenêtre ;
**Alt+F4** ferme l'application. Le programme n'est pas signé.

## Construction

Avec Python 3.11 ou plus récent, Node.js, Rust et les outils C++ Microsoft :

```powershell
python scripts/build-windows-portable.py
```

Le script télécharge la version fixe officielle de WebView2, vérifie son
empreinte, compile avec `tauri.portable.conf.json`, lance le contrôle natif
avec des profils de test séparés, puis produit le ZIP dans `release`.
Le moteur Microsoft est livré avec ses propres notices. Sa redistribution
en version fixe est décrite dans la documentation Microsoft :
https://learn.microsoft.com/microsoft-edge/webview2/concepts/distribution

Le moteur du ZIP ne se met pas à jour automatiquement : remplacer l'archive
complète lors d'une nouvelle livraison.
