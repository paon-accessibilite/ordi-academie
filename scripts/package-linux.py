"""Deb autonome : bibliothèques privées, aucune dépendance téléchargée à l'installation."""
import hashlib
import os
from pathlib import Path
import shutil
import subprocess as sp

def run(*args, **kw):
    return sp.run(args, check=True, **kw)

work = Path('linux-build').resolve()
work.mkdir(exist_ok=True)
root = work / 'package'
if root.exists():
    shutil.rmtree(root)
root.mkdir()
original = next(Path('src-tauri/target/release/bundle/deb').glob('*.deb'))
run('dpkg-deb', '-x', str(original), str(root))
run('dpkg-deb', '-e', str(original), str(root / 'DEBIAN'))
private = root / 'opt/ordi-academie'
private.mkdir(parents=True)
shutil.move(str(root / 'usr/bin/ordi-academie'), private / 'ordi-academie')
# Le dossier de ressources Tauri est conservé à son emplacement standard.
runtime = private / 'runtime'
runtime.mkdir()
archives = work / 'archives'
archives.mkdir(exist_ok=True)
packages = set()
base = ['libwebkit2gtk-4.1-0', 'libgtk-3-0t64', 'libgstreamer-plugins-base1.0-0',
        'gstreamer1.0-plugins-base', 'gstreamer1.0-plugins-good', 'gstreamer1.0-pulseaudio',
        'libgdk-pixbuf-2.0-0', 'librsvg2-common', 'libasound2t64', 'libpulse0',
        'libespeak-ng1', 'libstdc++6', 'fonts-dejavu-core', 'glib-networking']
for name in base:
    result = sp.check_output(['apt-rdepends', name], text=True, stderr=sp.DEVNULL)
    packages.update(line for line in result.splitlines() if line and not line[0].isspace())
manifest = []
for name in sorted(packages):
    # Les dépendances virtuelles n'ont pas d'archive ; leur fournisseur figure
    # dans la clôture des autres dépendances réelles (et les tests vérifient ldd).
    metadata = sp.check_output(['apt-cache', 'show', name], text=True, stderr=sp.DEVNULL)
    if 'Filename:' not in metadata:
        continue
    run('apt-get', 'download', name, cwd=archives, stdout=sp.DEVNULL)
for archive in sorted(archives.glob('*.deb')):
    run('dpkg-deb', '-x', str(archive), str(runtime))
    manifest.append({'file': archive.name, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest()})
# Ne jamais embarquer glibc ni son chargeur : ils appartiennent au système cible.
for file in runtime.rglob('*'):
    if file.name.startswith(('libc.so', 'libm.so', 'libpthread.so', 'libdl.so', 'librt.so', 'libresolv.so', 'libutil.so', 'ld-linux', 'ld-2.', 'libnss_')):
        if file.is_file() or file.is_symlink():
            file.unlink()
# Résoudre les liens Debian absolus dans le répertoire privé.
for file in runtime.rglob('*'):
    if file.is_symlink() and str(file.readlink()).startswith('/'):
        target = runtime / str(file.readlink()).lstrip('/')
        if target.exists():
            file.unlink()
            file.symlink_to(os.path.relpath(target, file.parent))
import json
(private / 'runtime-manifest.json').write_text(json.dumps(manifest, indent=2))
launcher = root / 'usr/bin/ordi-academie'
launcher.write_text('''#!/bin/sh
set -eu
base=/opt/ordi-academie
runtime="$base/runtime"
libs="$runtime/usr/lib/x86_64-linux-gnu:$runtime/lib/x86_64-linux-gnu:$runtime/usr/lib:$runtime/lib:/usr/lib/ordi-academie/piper"
export LD_LIBRARY_PATH="$libs${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export WEBKIT_EXEC_PATH="$runtime/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1"
export WEBKIT_INJECTED_BUNDLE_PATH="$WEBKIT_EXEC_PATH/injected-bundle"
export XDG_DATA_DIRS="$runtime/usr/share:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"
export GSETTINGS_SCHEMA_DIR="$runtime/usr/share/glib-2.0/schemas"
export GIO_MODULE_DIR="$runtime/usr/lib/x86_64-linux-gnu/gio/modules"
export GST_PLUGIN_SYSTEM_PATH_1_0="$runtime/usr/lib/x86_64-linux-gnu/gstreamer-1.0"
export GST_PLUGIN_SCANNER="$runtime/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-plugin-scanner"
export GDK_PIXBUF_MODULE_FILE="$base/loaders.cache"
# Xfce utilise X11 ; évite les différences de pilotes EGL sur les vieux PC.
export WEBKIT_DISABLE_DMABUF_RENDERER=1
exec "$base/ordi-academie" "$@"
''')
launcher.chmod(0o755)
loaders = list(runtime.rglob('gdk-pixbuf-2.0/2.10.0/loaders/*.so'))
query = '/usr/lib/x86_64-linux-gnu/gdk-pixbuf-2.0/gdk-pixbuf-query-loaders'
cache = sp.check_output([query, *map(str, loaders)], text=True)
cache = cache.replace(str(runtime), '/opt/ordi-academie/runtime')
(private / 'loaders.cache').write_text(cache)
schemas = runtime / 'usr/share/glib-2.0/schemas'
run('glib-compile-schemas', str(schemas))
control = root / 'DEBIAN/control'
lines = control.read_text().splitlines()
lines = [line for line in lines if not line.startswith(('Depends:', 'Installed-Size:'))]
lines += ['Depends: libc6 (>= 2.39)', 'Installed-Size: ' + str(sum(f.stat().st_size for f in root.rglob('*') if f.is_file()) // 1024)]
control.write_text('\n'.join(lines) + '\n')
if (root / 'DEBIAN/md5sums').exists():
    (root / 'DEBIAN/md5sums').unlink()
# Pas de script installant des paquets, ni de remplacement de fichier système.
desktop = next((root / 'usr/share/applications').glob('*.desktop'))
desktop.write_text(desktop.read_text().replace('Categories=', 'Categories=Education;'))
release = Path('release')
release.mkdir(exist_ok=True)
output = release / 'Ordi-Academie-0.1.0-linux-amd64.deb'
run('dpkg-deb', '--root-owner-group', '-Zxz', '-b', str(root), str(output))
(release / 'SHA256SUMS-linux.txt').write_text(hashlib.sha256(output.read_bytes()).hexdigest() + '  ' + output.name + '\n')
