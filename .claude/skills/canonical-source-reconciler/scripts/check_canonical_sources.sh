#!/usr/bin/env bash
set -euo pipefail

repo_root="${1:-$(pwd)}"
cd "$repo_root"

required_files=(
  "AGENTS.md"
  "CLAUDE.md"
  "NOTA_MANIFESTO.md"
  "DESIGN.md"
  "NOTA_LORE.md"
  "NOTA-BRAND-UIUX-PACK.md"
  "docs/HANDOVER.md"
  "docs/index.md"
)

missing=0
for file_path in "${required_files[@]}"; do
  if [[ ! -f "$file_path" ]]; then
    echo "MISSING_FILE $file_path"
    missing=1
  fi
done

if rg -n "no such file exists|not present|Pending import; no .* currently present" docs/HANDOVER.md docs/index.md >/dev/null 2>&1; then
  echo "STALE_MISSING_WARNING docs/HANDOVER.md or docs/index.md"
  missing=1
fi

for doc_name in NOTA_MANIFESTO.md DESIGN.md NOTA_LORE.md NOTA-BRAND-UIUX-PACK.md; do
  if ! rg -n "$doc_name" docs/index.md docs/HANDOVER.md >/dev/null 2>&1; then
    echo "UNROUTED_CANON $doc_name"
    missing=1
  fi
done

if [[ $missing -eq 0 ]]; then
  echo "CANONICAL_SOURCES_OK"
fi
