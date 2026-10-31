"""Build and validate the Windows ZIP with Microsoft's private WebView2 runtime."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
RUNTIME_VERSION = '156.0.4314.58'
RUNTIME_URL = ('https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/'
               'b7919cc9-680d-4253-bf32-732988e68aa6/'
               f'Microsoft.WebView2.FixedVersionRuntime.{RUNTIME_VERSION}.x64.cab')
CAB_SHA256 = '857dcfd6f7035508a29645fa2978c3a6a841f220df77cc366d318894e19f4792'


def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--skip-build', action='store_true', help='Package an already compiled portable executable')
    args = parser.parse_args()
    if os.name != 'nt':
        parser.error('Windows is required')
    os.chdir(ROOT)
    version = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
    qa = ROOT / '.qa'
    qa.mkdir(exist_ok=True)
    cab = qa / 'webview2-x64.cab'
    if not cab.exists():
        print('Downloading official Microsoft WebView2 runtime...', flush=True)
        urllib.request.urlretrieve(RUNTIME_URL, cab)
    if digest(cab) != CAB_SHA256:
        raise RuntimeError('WebView2 CAB checksum mismatch')

    # Re-extract the verified CAB every time, rather than reusing an unchecked runtime.
    expanded = Path(tempfile.mkdtemp(prefix='webview2-', dir=qa))
    with (expanded / 'expand.log').open('w') as log:
        subprocess.run(['expand.exe', str(cab), '-F:*', str(expanded)], check=True, stdout=log)
    runtime = expanded / f'Microsoft.WebView2.FixedVersionRuntime.{RUNTIME_VERSION}.x64'
    if not (runtime / 'msedgewebview2.exe').is_file():
        raise RuntimeError('WebView2 runtime missing after extraction')
    # Tauri validates this resource directory during compilation.
    shutil.copytree(runtime, ROOT / 'src-tauri/WebView2', dirs_exist_ok=True)
    if not args.skip_build:
        run('npm.cmd', 'test')
        run('npm.cmd', 'run', 'build')
        run('npm.cmd', 'run', 'tauri', '--', 'build', '--no-bundle', '--config',
            'src-tauri/tauri.portable.conf.json', '--', '--locked')

    staging = Path(tempfile.mkdtemp(prefix='portable-', dir=qa))
    folder = staging / f'Ordi-Academie-{version}'
    folder.mkdir()
    exe = folder / 'Ordi Academie.exe'
    shutil.copy2(ROOT / 'src-tauri/target/release/ordi-academie.exe', exe)
    shutil.copytree(runtime, folder / 'WebView2')
    shutil.copy2(ROOT / 'PORTABLE-WINDOWS.md', folder / 'LIRE-MOI.md')
    shutil.copy2(ROOT / 'THIRD-PARTY-NOTICES.txt', folder / 'THIRD-PARTY-NOTICES.txt')
    release = ROOT / 'release'
    release.mkdir(exist_ok=True)
    # A fresh report folder isolates this validation from real student profiles.
    test_dir = qa / (staging.name + '-validation')
    test_dir.mkdir()
    report_path = test_dir / 'report.json'
    for launch in range(2):
        subprocess.run([str(exe), '--smoke-test', str(report_path)], cwd=ROOT, check=True, timeout=45)
        report = json.loads(report_path.read_text(encoding='utf-8'))
        if not report.get('ok') or report['version'] != version:
            raise RuntimeError(report.get('error', 'Native validation failed'))
        if launch == 1 and report.get('existingSuccesses', 0) == 0:
            raise RuntimeError('The second launch did not restore progress')
        # Tauri uses Windows' \\?\ verbatim prefix; compare directory identity.
        if not Path(report.get('webviewRuntimeFolder', '')).samefile(folder / 'WebView2'):
            raise RuntimeError('The portable app did not select its private runtime')
        print(f'Native launch {launch + 1}: {len(report["checks"])} checks passed', flush=True)
    report['distribution'] = 'windows-x64-portable'
    report['webviewRuntimeVersion'] = RUNTIME_VERSION
    report['webviewRuntimeCabSha256'] = CAB_SHA256
    report['nativeLaunches'] = 2
    validation = release / f'validation-windows-portable-{version}.json'
    validation.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

    archive = release / f'Ordi-Academie-{version}-windows-x64-portable.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
        for path in sorted(folder.rglob('*')):
            if path.is_file():
                bundle.write(path, path.relative_to(staging))
    with zipfile.ZipFile(archive) as bundle:
        bad = bundle.testzip()
        if bad:
            raise RuntimeError(f'ZIP validation failed: {bad}')
    checksum = digest(archive)
    (release / 'SHA256SUMS-windows-portable.txt').write_text(f'{checksum}  {archive.name}\n', encoding='ascii')
    print(f'{archive.name}: {archive.stat().st_size} bytes, SHA256 {checksum}', flush=True)


if __name__ == '__main__':
    main()
