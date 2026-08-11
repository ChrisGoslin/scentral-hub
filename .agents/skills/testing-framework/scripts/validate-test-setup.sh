#!/bin/bash
# validate-test-setup.sh
# Validate that all required testing files and dependencies are in place

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Validating Test Setup..."
echo ""

# Check 1: package.json has test scripts
echo -n "✓ Checking package.json... "
if grep -q '"test:smoke"' package.json && grep -q '"test:e2e"' package.json; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}MISSING${NC}"
  echo "  Add to package.json:"
  echo '    "test:smoke": "node scripts/smoke-test.mjs",'
  echo '    "test:e2e": "playwright test",'
  exit 1
fi

# Check 2: smoke-test.mjs exists
echo -n "✓ Checking smoke test script... "
if [ -f "scripts/smoke-test.mjs" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}MISSING${NC}"
  echo "  Copy from skills/testing-framework/examples/smoke-test.example.mjs"
  exit 1
fi

# Check 3: playwright.config.ts exists
echo -n "✓ Checking Playwright config... "
if [ -f "playwright.config.ts" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}MISSING${NC}"
  echo "  Copy from skills/testing-framework/examples/playwright.config.example.ts"
  exit 1
fi

# Check 4: e2e directory exists
echo -n "✓ Checking e2e test directory... "
if [ -d "e2e" ]; then
  echo -e "${GREEN}OK${NC}"

  # Count test files
  count=$(find e2e -name "*.spec.ts" -o -name "*.spec.js" | wc -l)
  echo "  Found $count test files"
else
  echo -e "${YELLOW}EMPTY${NC}"
  echo "  Create e2e/ directory with tests"
fi

# Check 5: Playwright dependency installed
echo -n "✓ Checking @playwright/test... "
if npm list @playwright/test &> /dev/null; then
  version=$(npm list @playwright/test 2>/dev/null | grep @playwright/test | head -1)
  echo -e "${GREEN}OK${NC} ($version)"
else
  echo -e "${RED}MISSING${NC}"
  echo "  Install: npm install -D @playwright/test"
  exit 1
fi

# Check 6: Playwright browsers installed
echo -n "✓ Checking Playwright browsers... "
if [ -d "$HOME/.cache/ms-playwright" ] || [ -d "$HOME/Library/Caches/ms-playwright" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${YELLOW}NOT INSTALLED${NC}"
  echo "  Install: npx playwright@1.62.0 install chromium webkit"
fi

# Check 7: docs/qa-checklist.md exists
echo -n "✓ Checking QA checklist... "
if [ -f "docs/qa-checklist.md" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${YELLOW}MISSING${NC}"
  echo "  Create: docs/qa-checklist.md (optional but recommended)"
fi

# Check 8: CI/CD configuration
echo -n "✓ Checking CI/CD configuration... "
if [ -f ".github/workflows/test.yml" ] || [ -f ".github/workflows/tests.yml" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${YELLOW}NOT CONFIGURED${NC}"
  echo "  Add GitHub Actions workflow (optional)"
fi

echo ""
echo -e "${GREEN}✓ Test setup validation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run tests: npm run test:e2e"
echo "  2. Write tests in: e2e/*.spec.ts"
echo "  3. Run smoke tests: npm run test:smoke"
echo "  4. Complete QA checklist: docs/qa-checklist.md"
echo ""
