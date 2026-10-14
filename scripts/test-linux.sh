#!/usr/bin/env bash
set -euo pipefail
if [ "${1:-}" != '--user' ]; then
  runuser -u eleve -- bash /test-linux.sh --user
  cp /tmp/ordi-qa/report.json /result/validation-linux.json
  dpkg -r ordi-academie
  test ! -f /usr/bin/ordi-academie
  exit
fi
mkdir -p /tmp/ordi-qa
pulseaudio --start --exit-idle-time=-1
for run in 1 2; do
  timeout 90s dbus-run-session -- xvfb-run -a -s '-screen 0 1280x720x24' \
    ordi-academie --smoke-test /tmp/ordi-qa/report.json
  python3 - "$run" <<'PY'
import json, sys
r=json.load(open('/tmp/ordi-qa/report.json'))
print(json.dumps(r, ensure_ascii=False, indent=2))
assert r['ok'], r
assert r['audioBytes']>1000
if sys.argv[1]=='2': assert r['existingSuccesses']>=4, 'Les profils ne persistent pas'
PY
done
