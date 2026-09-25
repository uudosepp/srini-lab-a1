#!/usr/bin/env bash
# Lab peab käivituma ÜHE käsuga ka võõras masinas — see on dokumendi nõue
# („iseseisev ja paindlik") ja ühtlasi see, mida 1. osa devcontaineri slaid
# õpetab: agent töötab konteineris, mitte sinu masinas.
#
# Konteiner piirab plahvatuse raadiust, mitte plahvatust: repo ise on siin
# sees ja oma haru saab ikka rikkuda. Selle vastu on guard-hook ja haru kaitse.
set -euo pipefail
if [ -f package.json ]; then
  npm install --no-audit --no-fund
fi
echo
echo "Lab on valmis. Alusta:"
echo "  srini-lab start A1      # personaalne variant"
echo "  npm run selfcheck       # sama mõõtmine, mida grader teeb"
