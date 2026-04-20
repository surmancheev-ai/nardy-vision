#!/usr/bin/env bash

set -euo pipefail

TARGET="${1:-http://127.0.0.1:3000}"

echo "Smoke testing ${TARGET}"

check() {
  local path="$1"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "${TARGET}${path}")"

  if [[ "${code}" =~ ^2|3 ]]; then
    echo "[OK] ${path} -> ${code}"
  else
    echo "[FAIL] ${path} -> ${code}"
    exit 1
  fi
}

check "/"
check "/pricing"
check "/learn"
check "/login"
check "/register"
check "/analyze"
check "/api/health"

echo "Smoke test passed."
