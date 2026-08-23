#!/usr/bin/env bash
# install-latest.sh — install the latest RouterPlus release without building.
#
# Downloads the `omniroute-<version>.tgz` artifact attached to the latest GitHub
# Release (built and boot-verified by CI) and installs it globally via
# `npm install -g <tarball>`. Re-running it upgrades in place — the upgrade path
# (SQLite migrations over a populated DB) is proven by CI's check:install-upgrade.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/RouterPlus/router/main/scripts/install-latest.sh | bash
#
# Environment:
#   OMNIROUTE_REPO  GitHub repo to pull releases from (default: RouterPlus/router)
#   GH_TOKEN        Optional; sent as a Bearer token to raise the API rate limit

set -euo pipefail

REPO="${OMNIROUTE_REPO:-RouterPlus/router}"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

for cmd in curl npm; do
  command -v "$cmd" >/dev/null 2>&1 || die "'$cmd' is required but not found in PATH"
done

AUTH_HEADER=()
if [ -n "${GH_TOKEN:-}" ]; then
  AUTH_HEADER=(-H "Authorization: Bearer ${GH_TOKEN}")
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

log "Fetching latest release info for ${REPO}"
ASSET_URL="$(
  curl -fsSL "${AUTH_HEADER[@]}" "$API_URL" \
    | sed -n 's/.*"browser_download_url": *"\([^"]*\)".*/\1/p' \
    | grep -E '/omniroute-[0-9][0-9A-Za-z.+-]*\.tgz$' \
    | head -n 1
)" || ASSET_URL=""

[ -n "$ASSET_URL" ] || die "no omniroute-*.tgz asset found on the latest release of ${REPO}
      Check https://github.com/${REPO}/releases — the tarball is attached by the Publish to npm workflow."

FILE_NAME="${ASSET_URL##*/}"
TARGET="${TMP_DIR}/${FILE_NAME}"

log "Downloading ${FILE_NAME}"
curl -fsSL --retry 3 -o "$TARGET" "$ASSET_URL"

log "Installing globally (npm install -g ${FILE_NAME})"
if ! npm install -g --no-audit --no-fund "$TARGET"; then
  die "npm install failed. If this was an EACCES permission error, fix your npm prefix
      (e.g. 'npm config set prefix ~/.npm-global') or re-run with sudo."
fi

INSTALLED="$(omniroute --version 2>/dev/null || echo unknown)"
log "Installed omniroute ${INSTALLED} — run 'omniroute serve' to start (default port 20128)."
