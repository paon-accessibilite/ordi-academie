# Ordi Académie 0.2.0 pour Windows

## Installer

1. Télécharger `Ordi-Academie-0.2.0-windows-x64-setup.exe` depuis la release officielle du dépôt PAON.
2. Lancer l’installeur et suivre les étapes en français.
3. Ouvrir **Ordi Academie** dans le menu Démarrer, dossier **PAON**.
4. Créer un profil élève, puis se connecter au bureau simulé.

Windows 10 ou 11 en 64 bits. L’installeur embarque Microsoft WebView2 pour les postes sans Internet. L’application contient tous ses fichiers et ne demande pas de connexion pour les exercices.

La première version n’est pas signée avec un certificat de signature de code. Les fichiers officiels sont publiés sur :

- Sources : https://github.com/paon-accessibilite/ordi-academie
- Téléchargement : https://github.com/paon-accessibilite/ordi-academie/releases/tag/v0.2.0

Le fichier `SHA256SUMS-windows.txt` de la release permet de comparer l’empreinte du téléchargement avec `Get-FileHash -Algorithm SHA256` dans PowerShell.

## Utiliser en classe

L’application démarre en plein écran. **Quitter le plein écran** ou **Échap** revient au mode fenêtre ; **Alt+F4** ferme l’application. Les profils, les badges et les brouillons sont gardés localement pour l’utilisateur Windows courant. L’application sauvegarde aussi régulièrement la session pendant son utilisation.

La lecture vocale utilise les voix locales de Windows. Des voix françaises doivent être disponibles sur le poste. Les profils du navigateur ne sont pas importés automatiquement dans l’application : les deux versions possèdent leur propre stockage.

Les fichiers manipulés dans les missions restent des fichiers simulés : l’élève ne modifie pas les dossiers réels de Windows. Les profils élèves sont pédagogiques et ne sont pas protégés par un mot de passe.

## Désinstaller

Utiliser **Paramètres Windows → Applications → Ordi Academie → Désinstaller**. Pour éviter toute perte de données d’élèves, ne supprimer les données locales de l’application que si elles ne sont plus nécessaires.

## Construire depuis les sources

Avec Node.js, Rust et les outils de compilation C++ Microsoft installés :

```powershell
npm ci --ignore-scripts
npm test
npm run windows:build -- -- --locked
```

L’installeur se trouve dans `src-tauri/target/release/bundle/nsis`. Sa première construction demande Internet pour récupérer les dépendances et le moteur WebView2 ; l’installeur produit fonctionne hors connexion.

Le test du moteur Windows peut être lancé avec :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke-windows.ps1
```

Ce test utilise une fenêtre cachée et un dossier `.qa/webview-test` séparé des données des élèves.
