#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
piper_dir="$project_root/src-tauri/piper"
voice_dir="$piper_dir/voices"
piper_archive_sha256="a50cb45f355b7af1f6d758c1b360717877ba0a398cc8cbe6d2a7a3a26e225992"
voice_sha256="641d1ab097da2b81128c076810edb052b385decc8be3381814802a64a73baf99"
config_sha256="39479916c2db192b5ac9764daddd0c744d83e023ad890c6976c0633ae4df8959"
license_sha256="4cd71dece7037f1d6d93cce7570c57ab75ea9ac566fd4990be2f3ab08d15b47f"
model_card_sha256="bd8b8d079d4d3d2c4cc20345889bbcd586d72f021a132f93357a763eb5232cce"

if [[ -x "$piper_dir/piper" \
  && -f "$voice_dir/fr_FR-siwis-medium.onnx" \
  && -f "$voice_dir/fr_FR-siwis-medium.onnx.json" \
  && -f "$piper_dir/LICENSE.md" \
  && -f "$voice_dir/SIWIS-MODEL_CARD.md" ]] \
  && echo "$voice_sha256  $voice_dir/fr_FR-siwis-medium.onnx" | sha256sum --check --status \
  && echo "$config_sha256  $voice_dir/fr_FR-siwis-medium.onnx.json" | sha256sum --check --status \
  && echo "$license_sha256  $piper_dir/LICENSE.md" | sha256sum --check --status \
  && echo "$model_card_sha256  $voice_dir/SIWIS-MODEL_CARD.md" | sha256sum --check --status; then
  echo "Le moteur de synthèse vocale Linux est déjà prêt."
  exit 0
fi

work_dir="$(mktemp -d)"
trap 'rm -rf -- "$work_dir"' EXIT

curl --fail --location --retry 3 \
  https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
  --output "$work_dir/piper.tar.gz"
echo "$piper_archive_sha256  $work_dir/piper.tar.gz" | sha256sum --check

if [[ "$piper_dir" != "$project_root/src-tauri/piper" ]]; then
  echo "Chemin Piper inattendu : $piper_dir" >&2
  exit 1
fi
rm -rf -- "$piper_dir"
mkdir -p "$piper_dir" "$voice_dir"
tar -xzf "$work_dir/piper.tar.gz" --strip-components=1 -C "$piper_dir"

curl --fail --location --retry 3 \
  https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx \
  --output "$voice_dir/fr_FR-siwis-medium.onnx"
curl --fail --location --retry 3 \
  https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json \
  --output "$voice_dir/fr_FR-siwis-medium.onnx.json"
curl --fail --location --retry 3 \
  https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/MODEL_CARD \
  --output "$voice_dir/SIWIS-MODEL_CARD.md"
curl --fail --location --retry 3 \
  https://raw.githubusercontent.com/rhasspy/piper/38917ffd8c0e219c6581d73e07b30ef1d572fce1/LICENSE.md \
  --output "$piper_dir/LICENSE.md"

echo "$voice_sha256  $voice_dir/fr_FR-siwis-medium.onnx" | sha256sum --check
echo "$config_sha256  $voice_dir/fr_FR-siwis-medium.onnx.json" | sha256sum --check
echo "$license_sha256  $piper_dir/LICENSE.md" | sha256sum --check
echo "$model_card_sha256  $voice_dir/SIWIS-MODEL_CARD.md" | sha256sum --check
chmod +x "$piper_dir/piper"
