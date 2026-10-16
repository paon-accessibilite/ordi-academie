#!/usr/bin/env bash
set -euo pipefail
# Exercer le plein écran avec le même gestionnaire de fenêtres que Mint Xfce.
xfwm4 --compositor=off >/tmp/ordi-qa/xfwm4.log 2>&1 &
wm_pid=$!
trap 'kill "$wm_pid" 2>/dev/null || true' EXIT
for attempt in $(seq 1 50); do
  if xprop -root _NET_SUPPORTING_WM_CHECK | grep -q 'window id'; then break; fi
  sleep .1
done
xprop -root _NET_SUPPORTING_WM_CHECK | grep -q 'window id'
ordi-academie --smoke-test /tmp/ordi-qa/report.json
