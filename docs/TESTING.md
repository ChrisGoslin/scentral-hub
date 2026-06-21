# AnotherSense — Testing Guide

Complete testing strategy for the AnotherSense application, covering smoke tests, E2E tests, and manual QA.

---

## Quick Start

### Smoke Tests (HTTP Status Checks)
**What:** Fast HTTP requests to 9 critical routes on a live deployment.  
**Why:** Verify that the app is up and responsive; catch deploy failures immediately.  
**Time:** ~5 seconds

```bash
# Test localhost:3000
npm run test:smoke

# Test production
npm run test:smoke:prod

# Or manually specify a URL
BASE_URL=https://preview.vercel.app npm run test:smoke
```

**Routes tested:**
- `/` (Landing)
- `/discover` (Catalogue)
- `/collection` (My Bottles)
- `/layering` (Lab)
- `/you` (Profile)
- `/onboarding` (Profiler)
- `/api/fragrances?q=lattafa` (Search API)
- `/api/waitlist` (POST-only)
- `/api/wear` (POST-only)

---

## E2E Tests (Playwright)

### Prerequisites
```bash
# Install Playwright (first time only)
npx playwright install chromium webkit
```

### Run All Tests
```bash
npm run test:e2e
```

**Runs on:**
- Desktop: Chrome, Safari
- Mobile: iOS (iPhone 12), Android (Pixel 5)
- Parallelized: 5 workers

**Time:** ~1 minute

### Run with Browser Visible
```bash
npm run test:e2e:headed
```

Open your browser to watch tests run in real time.

### Run Specific Test File
```bash
npx playwright test e2e/onboarding.spec.ts
```

### Run Specific Test
```bash
npx playwright test -g "can complete 3-step profiler"
```

### Debug a Test
```bash
npx playwright test e2e/onboarding.spec.ts --debug
```

Opens Playwright Inspector; step through the test and inspect elements.

---

## Test Coverage

### Onboarding (`e2e/onboarding.spec.ts`)
- ✓ New users redirect to `/onboarding`
- ✓ 3-step profiler (Sanctuary → Projection → Context) → Persona reveal
- ✓ Persona stored in localStorage
- ✓ Skip button works

### Discover (`e2e/discover.spec.ts`)
- ✓ Page loads with 280+ fragrances
- ✓ Search works (debounce, results update)
- ✓ Filters toggle (Feel, Projection)
- ✓ Wishlist (heart button) functionality

### Collection (`e2e/collection.spec.ts`, `e2e/collection-drag-drop.spec.ts`)
- ✓ Living Wardrobe loads (4 tiers)
- ✓ Sidebar view modes exist (All, By House, By Season, Wishlist)
- ✓ Drag-drop reorders bottles (no errors)
- ✓ No console errors on page load

### Fragrance Detail (`e2e/fragrance-detail.spec.ts`)
- ✓ Click card → detail page loads
- ✓ Brand, projection, notes visible
- ✓ Wishlist button works

### You Tab (`e2e/you-tab.spec.ts`)
- ✓ Shows persona (if onboarded)
- ✓ Shows teaser cards (if not authenticated)
- ✓ Wishlist visible (if populated)

### Layering Lab (`e2e/layering-lab.spec.ts`)
- ✓ Page loads without errors
- ✓ Search input works
- ✓ Save button exists

---

## Manual QA Checklist

**File:** `docs/qa-checklist.md`

Before shipping:
1. Run smoke tests against production
2. Run E2E tests locally (all platforms)
3. Perform manual QA using checklist:
   - Persona flow (onboarding)
   - Discover flow (search, filter, detail)
   - Collection flow (add, reorder, log wear)
   - Mobile layout (390px width)
   - Accessibility (contrast, keyboard, screen reader)

---

## CI/CD Integration

### GitHub Actions (if configured)
```yaml
# .github/workflows/test.yml
- run: npm run test:smoke:prod
- run: npm run test:e2e
```

Run smoke tests on every deploy to production.  
Run E2E tests on pull requests and main branch.

---

## Troubleshooting

### E2E Test Timeouts
**Problem:** Test times out waiting for page load.  
**Cause:** Dev server slow, network latency, or element not rendering.  
**Fix:**
```bash
# Start dev server separately
npm run dev

# Run tests in a new terminal
npm run test:e2e
```

### "Page has closed" Error
**Problem:** Playwright navigates to new page after test finishes.  
**Cause:** Test doesn't await() redirect or click.  
**Fix:** Use `page.waitForURL()` or `page.waitForNavigation()`.

### Flaky Mobile Tests
**Problem:** Mobile Safari tests timeout or fail intermittently.  
**Cause:** Mobile emulation uses shared resources; slower than desktop.  
**Fix:** Increase timeout or skip mobile in CI (test locally if critical).

### Selectors Not Found
**Problem:** `getByText()` or `getByRole()` returns no elements.  
**Cause:** Text doesn't exist, is hidden, or is in an iframe.  
**Fix:** Use `page.locator()` with CSS, or use `--debug` to inspect DOM.

---

## Performance Baselines

Target metrics (Lighthouse, throttled):

| Page | FCP | LCP | CLS |
|------|-----|-----|-----|
| Discover | < 1.5s | < 2.0s | < 0.1 |
| Collection | < 1.0s | < 1.5s | < 0.05 |
| Detail | < 0.8s | < 1.2s | < 0.05 |
| Onboarding | < 1.2s | < 1.8s | < 0.05 |

Run Lighthouse locally:
```bash
npm run dev
# In separate terminal:
npx lighthouse http://localhost:3000 --view
```

---

## Adding New Tests

### Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: set localStorage, navigate, etc.
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });

  test('user can do X', async ({ page }) => {
    // Arrange
    await page.goto('/path');

    // Act
    await page.getByRole('button', { name: 'Action' }).click();

    // Assert
    await expect(page.locator('text=Result')).toBeVisible();
  });
});
```

### Best Practices
1. Use `getByRole()` or `getByText()` — stable selectors
2. Avoid `data-testid` unless necessary (add to codebase if needed)
3. Use `page.waitForLoadState('networkidle')` for heavy pages
4. Catch and ignore benign errors: `.catch(() => {})`
5. Set reasonable timeouts: default 30s is OK for slow CI

### Run Before Committing
```bash
npm run test:e2e -- --grep "new test name"
```

---

## Related Documents

- [QA Checklist](qa-checklist.md) — Manual verification steps
- [Project CLAUDE.md](../CLAUDE.md) — Testing rules and dependencies
- [Playwright Docs](https://playwright.dev/docs/intro) — Official guide
