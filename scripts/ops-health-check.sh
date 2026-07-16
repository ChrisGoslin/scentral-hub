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
  local fn=$2

  if "$fn" > /dev/null 2>&1; then
    echo "✅ $name"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo "❌ $name"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
  fi
}

check_homepage() {
  curl -fsSL "$SITE_URL" | grep -qi "nota"
}

check_shelf_api() {
  local status
  status=$(curl -fsS -o /dev/null -w "%{http_code}" "$SITE_URL/api/shelf")
  case "$status" in
    200|401) return 0 ;;
    *) return 1 ;;
  esac
}

check_trails_page() {
  curl -fsSL "$SITE_URL/trails" | grep -qi "trail"
}

check_supabase() {
  supabase projects list > /dev/null 2>&1
}

check_build() {
  cd "$PROJECT_ROOT" && npm run build
}

echo "Deployment Health"
check "Vercel deployment active" check_homepage
check "API routes responding" check_shelf_api
check "Public pages accessible" check_trails_page
echo ""

echo "Database Health"
check "Supabase responsive" check_supabase
echo ""

echo "Build Health"
check "TypeScript builds" check_build
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
