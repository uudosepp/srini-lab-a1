#!/usr/bin/env bash
# Lepingu ots (üldine grader): jooksuta peidetud testid + kontrollküsimused,
# kirjuta lab/metrics.json. Hindamisel annab graderi SRINI_HIDDEN_SEED muutuja
# (vt run-grader.mjs) — see jääb ALATI eelistatuks. Enesekontrolliks (kohapeal,
# `bash lab/measure.sh <sinu-seeme>`) tuleb seeme käsurea argumendist, täpselt
# nagu iga teise labi juures — ilma selleta kasutaksid iga kord üldist
# "local-selfcheck" varianti, mitte enda oma.
set -euo pipefail
cd "$(dirname "$0")/.."

SEED="${1:-local-selfcheck}"
export SRINI_HIDDEN_SEED="${SRINI_HIDDEN_SEED:-$SEED}"

FEATURE_OK=1
REGRESSION_OK=1
node --test lab/feature-check.mjs > /tmp/a1-feature.$$.log 2>&1 || FEATURE_OK=0
node --test lab/regression-check.mjs > /tmp/a1-regression.$$.log 2>&1 || REGRESSION_OK=0
cat /tmp/a1-feature.$$.log
cat /tmp/a1-regression.$$.log
rm -f /tmp/a1-feature.$$.log /tmp/a1-regression.$$.log

ANSWERS_JSON=$(node lab/check-answers.mjs "$SRINI_HIDDEN_SEED")

node -e "
const fs = require('fs');
const a = $ANSWERS_JSON;
fs.writeFileSync('lab/metrics.json', JSON.stringify({
  featureTestsOk: $FEATURE_OK === 1,
  existingTestsOk: $REGRESSION_OK === 1,
  questionsCorrect: a.questionsCorrect,
  questionsTotal: a.questionsTotal,
}, null, 2));
"
cat lab/metrics.json
