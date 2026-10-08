#!/usr/bin/env bash
# Clone-and-run launcher for RealEST.
# Usage: ./start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

bootstrap_node() {
  if command -v node >/dev/null 2>&1; then
    return 0
  fi

  local fnm_bin=""
  if command -v fnm >/dev/null 2>&1; then
    fnm_bin="$(command -v fnm)"
  elif [[ -x "${HOME}/.local/share/fnm/fnm" ]]; then
    fnm_bin="${HOME}/.local/share/fnm/fnm"
    export PATH="${HOME}/.local/share/fnm:${PATH}"
  fi

  if [[ -n "${fnm_bin}" ]]; then
    eval "$("${fnm_bin}" env --shell bash)"
    if [[ -f "${ROOT}/.node-version" ]]; then
      fnm use --install-if-missing "$(tr -d '[:space:]' < "${ROOT}/.node-version")" >/dev/null
    fi
    return 0
  fi

  if [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    . "${HOME}/.nvm/nvm.sh"
    if [[ -f "${ROOT}/.node-version" ]]; then
      nvm use "$(tr -d '[:space:]' < "${ROOT}/.node-version")" >/dev/null 2>&1 \
        || nvm install "$(tr -d '[:space:]' < "${ROOT}/.node-version")"
    fi
  fi
}

bootstrap_node

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required and was not found." >&2
  echo "Install fnm (https://github.com/Schniz/fnm) or Node from https://nodejs.org then re-run ./start.sh" >&2
  exit 1
fi

# TypeScript CLI via tsx (works on Node 20+; npx fetches tsx if not installed yet).
if [[ -x "${ROOT}/node_modules/.bin/tsx" ]]; then
  exec "${ROOT}/node_modules/.bin/tsx" "${ROOT}/scripts/start-app.ts" "$@"
fi
exec npx --yes tsx "${ROOT}/scripts/start-app.ts" "$@"
