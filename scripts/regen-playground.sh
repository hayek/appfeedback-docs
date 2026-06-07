#!/usr/bin/env bash
#
# Rebundle the live widget used by /playground from the sibling appfeedback-web
# repo into public/playground/afb-widget.mjs. The bundle is a single self-contained
# browser ESM that re-exports mountFeedbackWidget + currentWebDeviceInfo (from
# @appfeedback/widget) and formatIssueBody + labelsFor (from @appfeedback/core),
# so the playground can both run the real widget and render the exact wire-format
# issue body on submit. Re-run when the widget or formatter changes.
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_WIDGET="$(cd "$DOCS_DIR/../appfeedback-web/packages/widget" && pwd)"
OUT="$DOCS_DIR/public/playground/afb-widget.mjs"

ENTRY="$WEB_WIDGET/.afb-pg-entry.ts"
cat > "$ENTRY" <<'TS'
export { mountFeedbackWidget, currentWebDeviceInfo } from './src/index'
export { formatIssueBody, labelsFor } from '@appfeedback/core'
TS
trap 'rm -f "$ENTRY"' EXIT

( cd "$WEB_WIDGET" && pnpm dlx esbuild .afb-pg-entry.ts \
    --bundle --format=esm --platform=browser --outfile="$OUT" )

echo "==> Wrote $OUT"
