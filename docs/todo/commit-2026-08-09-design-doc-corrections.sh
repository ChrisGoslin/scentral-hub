#!/usr/bin/env bash
# Archived audit helper. It must remain read-only and never stage, commit, or delete.
# Preserves the review surface from the 2026-08-09 handover without execution authority.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "ARCHIVED: read-only design-doc audit; no files will be changed."
echo "Current diff on root design docs:"
git diff -- DESIGN.md NOTA-BRAND-UIUX-PACK.md
git diff --check -- DESIGN.md NOTA-BRAND-UIUX-PACK.md
echo "Audit complete. Re-verify scope and obtain fresh authority before any commit or deletion."
