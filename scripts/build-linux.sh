#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/prepare-linux-speech.sh
npm run build
npx tauri build --config src-tauri/tauri.linux.conf.json --bundles deb -- --locked
python3 scripts/package-linux.py
