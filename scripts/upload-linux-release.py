"""Joindre uniquement les fichiers Linux validés au brouillon de leur version."""
import hashlib
import json
import os
from pathlib import Path
import urllib.parse
import urllib.request

version = json.loads(Path('package.json').read_text(encoding='utf-8'))['version']
repository = os.environ.get('GITHUB_REPOSITORY', 'paon-accessibilite/ordi-academie')
headers = {'Authorization': 'Bearer ' + os.environ['GH_TOKEN'], 'Accept': 'application/vnd.github+json'}
request = urllib.request.Request(f'https://api.github.com/repos/{repository}/releases?per_page=100', headers=headers)
with urllib.request.urlopen(request, timeout=60) as response:
    releases = json.load(response)
release = next(r for r in releases if r['tag_name'] == 'v' + version)
assert release['draft'], 'Les fichiers sont joints avant la publication du brouillon'
report = json.loads(Path('release/validation-linux.json').read_text(encoding='utf-8'))
assert report['ok'] and report['version'] == version and report['nativeRightClick']
for name in [f'Ordi-Academie-{version}-linux-amd64.deb', 'SHA256SUMS-linux.txt', 'validation-linux.json']:
    data = Path('release', name).read_bytes()
    digest = 'sha256:' + hashlib.sha256(data).hexdigest()
    existing = next((a for a in release['assets'] if a['name'] == name), None)
    if existing:
        assert existing['digest'] == digest, 'Un fichier différent existe déjà dans le brouillon'
        continue
    url = release['upload_url'].split('{')[0] + '?name=' + urllib.parse.quote(name)
    request = urllib.request.Request(url, method='POST', data=data, headers={**headers, 'Content-Type': 'application/octet-stream'})
    with urllib.request.urlopen(request, timeout=300) as response:
        asset = json.load(response)
    assert asset['digest'] == digest
    print(asset['name'], asset['size'], digest)
