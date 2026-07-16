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
    ((CHECKS_PASSED++))
  else
    echo "❌ $name"
    ((CHECKS_FAILED++))
  fi
}

echo "Deployment Health"
check "Vercel deployment active" 'curl -s "$1" | grep -q "nota"' "$SITE_URL"
check "API routes responding" 'curl -s -I "$1/api/shelf" | grep -qE "401|200"' "$SITE_URL"
check "Public pages accessible" 'curl -s "$1/trails" | grep -qi "trail"' "$SITE_URL"
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
