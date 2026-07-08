---
name: Testing Framework
description: This skill should be used when the user asks to "set up testing", "create smoke tests", "write E2E tests", "add Playwright tests", "create QA checklist", "verify deployment", or mentions testing strategy for Next.js applications. Provides comprehensive testing guidance for smoke tests, end-to-end tests, and manual QA workflows.
version: 0.1.0
---

# Testing Framework Skill

## Purpose

Establish a complete testing strategy for Next.js applications using:
- **Smoke tests** — Fast HTTP checks against live deployments (5-10 seconds)
- **E2E tests** — Browser automation with Playwright (1-2 minutes, desktop + mobile)
- **Manual QA** — Comprehensive checklist for human verification before launch

This skill is designed for rapid, confidence-building validation at deployment time and throughout development.

## When to Use This Skill

Use this skill when:
- Setting up testing for a new Next.js project
- Creating smoke tests for deployment verification
- Writing Playwright E2E tests for critical user flows
- Preparing a QA checklist before launch
- Debugging test failures or performance issues
- Integrating testing into CI/CD pipelines

## Core Testing Strategy

### 1. Smoke Tests (HTTP Status Checks)

**Purpose:** Verify the app is up and responding on live deployments.  
**Time:** ~5-10 seconds  
**When to run:** After every production deploy, in CI/CD pipelines

**Setup:**
```bash
npm run test:smoke                    # Test localhost:3000
npm run test:smoke:prod              # Test production
BASE_URL=https://preview.url npm run test:smoke  # Custom URL
```

**Coverage:** Test 7-9 critical routes:
- Landing page (`/`)
- Primary feature pages (e.g., `/discover`, `/collection`)
- Secondary pages (e.g., `/layering`, `/profile`)
- API endpoints (e.g., `/api/fragrances`, `/api/waitlist`)

**Script location:** `scripts/smoke-test.mjs`

**Structure:**
```javascript
const ROUTES = [
  ['/', 200, 'Landing page'],
  ['/discover', 200, 'Discover/catalogue'],
  ['/collection', 200, 'User inventory'],
  ['/api/endpoint', 405, 'POST-only endpoint'],
];
```

### 2. E2E Tests (Playwright)

**Purpose:** Verify critical user journeys work end-to-end across browsers and devices.  
**Time:** ~1-2 minutes (parallel workers)  
**When to run:** On PR, before merge to main, post-deploy verification

**Setup:**
```bash
npm install -D @playwright/test

npm run test:e2e              # All tests, all platforms
npm run test:e2e:headed      # Watch in browser
npx playwright test -g "search"  # Specific test
npx playwright test --debug  # Step through test
```

**Coverage areas:**
- Onboarding/authentication flows
- Search and filtering
- Create/edit/delete operations
- Data persistence (localStorage, API)
- Mobile responsiveness (390px+)
- Cross-browser compatibility (Chrome, Safari, Mobile)

**Test patterns:** See `references/e2e-patterns.md` for:
- Setup and teardown best practices
- Selector strategies (getByRole, getByText vs. data-testid)
- Handling async operations (waitForLoadState, waitForNavigation)
- Mocking API responses for isolated testing
- Mobile device emulation

**File structure:**
```
e2e/
├── onboarding.spec.ts      # Auth and user setup flows
├── discover.spec.ts        # Search, filtering, navigation
├── collection.spec.ts      # CRUD operations
├── user-profile.spec.ts    # Profile and settings
└── critical-paths.spec.ts  # Full user journeys
```

### 3. Manual QA Checklist

**Purpose:** Human verification of features, accessibility, and edge cases before launch.  
**Time:** ~30-60 minutes per release  
**When to run:** Pre-launch, after major refactors

**Checklist sections:**
- Feature flows (onboarding, discover, collection)
- Mobile layout (390px-wide phones, safe areas, notches)
- Accessibility (WCAG 2.1 AA: contrast, keyboard, screen reader)
- Performance (FCP < 1.5s, LCP < 2.0s, CLS < 0.1)
- Browser compatibility (Chrome, Safari, Firefox)
- Cross-device (Desktop, iPhone, Android)

See `docs/qa-checklist.md` for full checklist template.

## Quick Reference: npm Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "test:smoke": "node scripts/smoke-test.mjs",
    "test:smoke:prod": "BASE_URL=https://scentral-hub.vercel.app node scripts/smoke-test.mjs",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

## Implementation Steps

### Step 1: Create Smoke Test Script
```bash
touch scripts/smoke-test.mjs
# See: examples/smoke-test.example.mjs
```

Routes to test (minimum):
- Landing page (GET `/` → 200)
- Primary features (GET `/discover` → 200)
- API endpoints (GET `/api/post-only` → 405, verifying POST-only)

### Step 2: Set Up Playwright
```bash
npm install -D @playwright/test
npx playwright install chromium
touch playwright.config.ts
# See: examples/playwright.config.example.ts
```

Configure:
- `testDir: './e2e'` (where tests live)
- Base URL: `http://localhost:3000`
- Browsers: Chromium, WebKit (Safari), Mobile Chrome, Mobile Safari
- Retries: 0 locally, 2 in CI

### Step 3: Write E2E Tests
```bash
touch e2e/onboarding.spec.ts
# See: examples/e2e-test.example.ts
```

Follow the AAA pattern:
- **Arrange:** Setup (navigate, set localStorage)
- **Act:** User interaction (click, fill, scroll)
- **Assert:** Verify outcome (check URL, visible text, data)

### Step 4: Create QA Checklist
```bash
touch docs/qa-checklist.md
# See: examples/qa-checklist.example.md
```

Sections:
- Feature flows (critical user journeys)
- Mobile layout (responsive design)
- Accessibility (WCAG 2.1 AA)
- Performance (Core Web Vitals)
- Browser support
- Sign-off section

### Step 5: Integrate into CI/CD
```bash
# GitHub Actions example
- run: npm run test:smoke:prod          # After deploy
- run: npm run test:e2e                 # Before merge
```

## Common Patterns

### Pattern: Setup Fixtures (beforeEach)
```typescript
test.beforeEach(async ({ page }) => {
  // Set localStorage before each test
  await page.addInitScript(() => {
    localStorage.setItem('app_onboarded', 'true');
  });
});
```

### Pattern: Wait for Network (Loading States)
```typescript
// Wait for page to fully load
await page.waitForLoadState('networkidle');

// Or wait for specific element
await expect(page.locator('text=Results')).toBeVisible({ timeout: 3000 });
```

### Pattern: Selector Priority
Use in this order (most to least reliable):
1. `getByRole()` — "heading", "button", "link"
2. `getByText()` — Visible text content
3. `getByLabel()` — Form labels
4. `getByPlaceholder()` — Input placeholders
5. `locator()` — CSS selectors (last resort)

Avoid `data-testid` unless testing multiple identical elements.

### Pattern: Mobile Testing
```typescript
test('mobile layout (Pixel 5)', async ({ page }) => {
  // Pixel 5 context (375px width) already set by playwright.config.ts
  await page.goto('/');
  const isMobile = await page.evaluate(() => window.innerWidth < 480);
  expect(isMobile).toBe(true);
});
```

## Performance Baselines

Target these metrics (Lighthouse throttled):

| Page | FCP | LCP | CLS |
|------|-----|-----|-----|
| Landing | < 1.2s | < 1.8s | < 0.05 |
| Discover | < 1.5s | < 2.0s | < 0.1 |
| Collection | < 1.0s | < 1.5s | < 0.05 |
| Detail | < 0.8s | < 1.2s | < 0.05 |

Run locally:
```bash
npx lighthouse http://localhost:3000 --view
```

## Debugging & Troubleshooting

For detailed troubleshooting steps, anti-patterns, and solutions:
- See `references/troubleshooting.md`

**Quick fixes:**
- **Test timeout:** Start `npm run dev` separately before running tests
- **Selector not found:** Use `--debug` mode to inspect DOM
- **Flaky mobile tests:** Increase timeout or skip in CI
- **Network errors:** Check `page.waitForLoadState()` or mock API responses

## Files to Reference

- **`references/e2e-patterns.md`** — Detailed Playwright patterns and anti-patterns
- **`references/performance-baselines.md`** — Core Web Vitals and optimization
- **`references/troubleshooting.md`** — Common issues and solutions
- **`examples/smoke-test.example.mjs`** — Working smoke test script
- **`examples/e2e-test.example.ts`** — Playwright test template
- **`examples/playwright.config.example.ts`** — Config for desktop + mobile

## CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Test

on: [pull_request, push]

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:smoke:prod

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

### Pre-Deploy Checklist
1. ✅ All tests passing locally
2. ✅ Build succeeds (`npm run build`)
3. ✅ Smoke tests pass against staging
4. ✅ Deploy to production
5. ✅ Run `npm run test:smoke:prod` to verify

## Best Practices

✅ **DO:**
- Run smoke tests immediately after deploy
- Write E2E tests for critical user flows only
- Use fixtures (beforeEach) for common setup
- Check accessibility as part of QA
- Test on actual mobile devices when possible
- Keep test data clean (use test-specific IDs)
- Mock external APIs in E2E tests

❌ **DON'T:**
- Test implementation details (test user behavior)
- Use brittle selectors (test stable DOM structure)
- Ignore flaky tests (fix the root cause)
- Test third-party libraries (trust their tests)
- Overuse `wait` or `sleep` (use proper waits)
- Commit tests with `.only` or `.skip`

## Related Skills

- **CI/CD Pipeline Setup** — Integrating tests into deployment
- **Performance Optimization** — Improving Core Web Vitals
- **Accessibility Review** — WCAG 2.1 AA compliance

## When NOT to use this skill

This skill is generic Playwright/smoke-test mechanics — HOW to write and run tests. For the scentral-hub-specific POLICY of what gets tested at which layer, when a bug fix requires a new test, and how CI stages are rolled out, use `qe-automation` instead (it defers back to this skill for the raw mechanics). For rate-limit/abuse test scenarios specifically, see `resilience-abuse`. For RLS adversarial testing, see `security-hardening`.

### Corrections (2026-07-05)
- The npm scripts in "Quick Reference" match `package.json` as of this date, with one addition not listed here: `npm run sanity-check` (`scripts/sanity-check.mjs`) also exists as a pre-flight check. Re-verify: `cat package.json | grep -A1 '"scripts"'` or `python3 -c "import json;print(json.load(open('package.json'))['scripts'])"`.
- The `e2e/` file structure example (`onboarding.spec.ts`, `discover.spec.ts`, `collection.spec.ts`, `user-profile.spec.ts`, `critical-paths.spec.ts`) is illustrative, not the real current file list. Actual specs as of this date: `collection-drag-drop.spec.ts`, `collection.spec.ts`, `discover.spec.ts`, `fragrance-detail.spec.ts`, `layering-lab.spec.ts`, `layering-save.spec.ts`, `onboarding.spec.ts`, `you-tab.spec.ts`. Re-verify: `ls e2e/*.spec.ts`.
- There is no `e2e/security/` directory yet (the RLS adversarial suite referenced by `security-hardening` is planned, not shipped). Re-verify: `ls e2e/`.

## Provenance and maintenance

Derived from: `package.json` scripts, `e2e/` directory listing, `.github/workflows/ci.yml`.

Re-verify when picking this skill back up:
- Scripts still match: `cat package.json | grep -A1 '"scripts"'`.
- Current e2e spec list: `ls e2e/*.spec.ts`.
- CI workflow shape: `cat .github/workflows/ci.yml`.
- Playwright browsers/projects configured: `cat playwright.config.ts | grep -A1 "projects:"`.
