#!/bin/bash
# Daily health check for nota. production

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         nota. Production Health Check                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

check() {
  local name=$1
  local command=$2

  if eval "$command" > /dev/null 2>&1; then
    echo "✅ $name"
    ((CHECKS_PASSED++))
  else
    echo "❌ $name"
    ((CHECKS_FAILED++))
  fi
}

echo "Deployment Health"
check "Vercel deployment active" "curl -s https://scentral-hub.vercel.app | grep -q 'nota'"
check "API routes responding" "curl -s -I https://scentral-hub.vercel.app/api/shelf | grep -q '401\\|200'"
check "Public pages accessible" "curl -s https://scentral-hub.vercel.app/trails | grep -q 'trail\\|Trail'"
echo ""

echo "Database Health"
check "Supabase responsive" "supabase projects list > /dev/null 2>&1"
echo ""

echo "Build Health"
check "TypeScript builds" "cd /Users/christophergoslin/Projects/scentral-hub && npm run build 2>&1 | grep -q 'Compiled successfully'"
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
