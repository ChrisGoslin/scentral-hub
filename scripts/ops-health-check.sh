#!/bin/bash
# Daily health check for nota. production

set -e

SITE_URL="${SITE_URL:-${NEXT_PUBLIC_SITE_URL:-https://scentral-hub.vercel.app}}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         nota. Production Health Check                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

check() {
  local name=$1
  local script=$2
  shift 2

  if bash -c "$script" bash "$@" > /dev/null 2>&1; then
    echo "✅ $name"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo "❌ $name"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
  fi
}

echo "Deployment Health"
check "Vercel deployment active" 'body=$(curl -fsSL "$1") && printf "%s" "$body" | grep -qi "nota"' "$SITE_URL"
check "API routes responding" 'status=$(curl -sS -o /dev/null -w "%{http_code}" "$1/api/shelf") && case "$status" in 200|401|405) exit 0;; *) exit 1;; esac' "$SITE_URL"
check "Public pages accessible" 'body=$(curl -fsSL "$1/trails") && printf "%s" "$body" | grep -qi "trail"' "$SITE_URL"
echo ""

echo "Database Health"
check "Supabase responsive" 'supabase projects list > /dev/null 2>&1'
echo ""

echo "Build Health"
check "TypeScript builds" 'cd "$1" && npm run build > /dev/null 2>&1' "$PROJECT_ROOT"
echo ""

echo "Summary"
echo "  ✅ Passed: $CHECKS_PASSED"
echo "  ❌ Failed: $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo "✅ All health checks passed!"
  exit 0
else
  echo "⚠️  $CHECKS_FAILED check(s) failed. Investigate above."
  exit 1
fi
