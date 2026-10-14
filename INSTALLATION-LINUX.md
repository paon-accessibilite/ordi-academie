# Ordi Académie pour Linux

Cible : Linux Mint 22.3 Xfce, PC 64 bits (amd64).

Ouvrir le fichier `.deb` avec l'installateur de paquets, puis choisir Installer.
On peut également utiliser `sudo dpkg -i Ordi-Academie-0.1.0-linux-amd64.deb`.
L'installation et l'utilisation ne demandent pas de connexion Internet.
Lancer Ordi Académie depuis le menu Éducation. Échap quitte le plein écran.

Le paquet contient le moteur d'affichage, ses bibliothèques et la voix française
Piper SIWIS. Les bibliothèques sont privées à l'application : elles ne remplacent
pas celles de Linux Mint. Le noyau, la glibc et les pilotes graphiques/audio sont
fournis par le système cible. Aucune installation séparée de WebKit ou de voix
n'est nécessaire. Les licences tierces sont incluses dans le paquet.

Les profils restent sur cet ordinateur, séparés de ceux de l'application Windows.
Les dossiers et documents des exercices sont simulés. Ils ne modifient pas les
fichiers personnels de l'élève.

Désinstallation : `sudo dpkg -r ordi-academie`. Les profils sont conservés dans
les données utilisateur. La suppression du paquet ne les efface pas.

Compilation sous Ubuntu 24.04 / Mint 22 : installer Node.js, Rust, Python 3,
libwebkit2gtk-4.1-dev, libayatana-appindicator3-dev, librsvg2-dev, patchelf,
apt-rdepends et curl, puis exécuter `npm ci`, `npm test`, `npm run linux:build`.
La compilation télécharge les dépendances ; le paquet final fonctionne hors ligne.
