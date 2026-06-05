#!/usr/bin/env bash
set -euo pipefail

BRANCH=${1:-feature/landing-hero-demo-save}
git checkout -b "$BRANCH"
git add .
git commit -m "feat(landing): premium hero, demo save, design spec"
git push -u origin "$BRANCH"

echo "Branch $BRANCH pushed. Open a PR on GitHub with title: 'feat: premium landing hero + demo save'"
