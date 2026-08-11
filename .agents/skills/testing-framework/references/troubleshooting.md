# Testing Troubleshooting Guide

## Smoke Test Issues

### Problem: "EAI_AGAIN" or "ECONNREFUSED"

**Symptom:**
```
Error: getaddrinfo EAI_AGAIN scentral-hub.vercel.app
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Cause:** Network unreachable or dev server not running.

**Solution:**
1. Check internet connection: `ping google.com`
2. Verify dev server running: `npm run dev` (in separate terminal)
3. Verify URL is correct: `curl https://scentral-hub.vercel.app`
4. If CI/CD: Check if deployment succeeded before running smoke tests

### Problem: "Response status 404 on homepage"

**Symptom:**
```
✗ Landing page (404)
```

**Cause:** Page doesn't exist or deployment incomplete.

**Solution:**
1. Verify route exists: `find app -name "page.tsx" | grep -E '^app/page\.tsx'`
2. Check build succeeded: `npm run build`
3. If deployed: Wait 30s for Vercel to complete deployment
4. Check for routing middleware interfering

### Problem: "Timeout waiting for response"

**Symptom:**
```
Error: request timed out after 10000ms
```

**Cause:** Server too slow or hanging.

**Solution:**
1. Check server logs: `vercel logs` (production)
2. Increase timeout: Edit `scripts/smoke-test.mjs` increase `timeout: 10_000`
3. If CI/CD: Check resource limits, may need better server
4. Profile app: `npx lighthouse https://app.url --view`

---

## E2E Test Issues

### Problem: Test Timeout (30 seconds)

**Symptom:**
```
Test timeout of 30000ms exceeded.
Error: page.goto: Test timeout of 30000ms exceeded.
```

**Cause:** Page not loading, element not found, or dev server slow.

**Solutions:**

1. **Start dev server separately** (most common)
   ```bash
   npm run dev
   # In new terminal:
   npm run test:e2e
   ```

2. **Increase timeout for specific test**
   ```typescript
   test('slow page', async ({ page }) => {
     test.setTimeout(60000);  // 60 second timeout
     await page.goto('/slow-page');
   });
   ```

3. **Disable page load wait**
   ```typescript
   await page.goto('/page', { waitUntil: 'domcontentloaded' });
   // Instead of default 'load'
   ```

4. **Check if element actually exists**
   ```bash
   npx playwright test --debug
   # Inspect page in browser, verify selectors match
   ```

### Problem: "Element not found"

**Symptom:**
```
Error: locator.click: Timeout 30000ms exceeded waiting for locator('text=Sign in')
```

**Causes & Solutions:**

1. **Text doesn't exist or has different content**
   ```typescript
   // ❌ Wrong
   await page.getByText('Sign in').click();

   // ✅ Use flexible matching
   await page.getByText(/sign in/i).click();

   // ✅ Use role instead
   await page.getByRole('button', { name: 'Sign in' }).click();
   ```

2. **Element is in iframe**
   ```typescript
   // ❌ Can't find element outside iframe
   await page.getByText('Content').click();

   // ✅ Access iframe explicitly
   const frameHandle = await page.$('iframe[name="editor"]');
   const frame = await frameHandle?.contentFrame();
   await frame?.getByText('Content').click();
   ```

3. **Element not visible (hidden or off-screen)**
   ```typescript
   // ✅ Force click even if not visible
   await page.click('text=Hidden button', { force: true });

   // ✅ Or scroll into view first
   await page.locator('text=Button').scrollIntoViewIfNeeded();
   await page.locator('text=Button').click();
   ```

4. **Selector changed in code**
   ```typescript
   // Debug mode to inspect page
   npx playwright test e2e/test.spec.ts --debug

   // Or print page content
   await page.addInitScript(() => {
     console.log('Current URL:', window.location.href);
     console.log('Page title:', document.title);
   });
   ```

### Problem: "Locator returned multiple elements"

**Symptom:**
```
Error: strict mode violation: getByRole('button', { name: 'Delete' }) resolved to 2 elements
```

**Cause:** Multiple matching elements (ambiguous).

**Solution:** Be more specific
```typescript
// ❌ Ambiguous
await page.getByRole('button', { name: 'Delete' }).click();

// ✅ Target specific instance
await page.locator('text=Item Name').closest('div').getByRole('button', { name: 'Delete' }).click();

// ✅ Or use nth()
await page.getByRole('button', { name: 'Delete' }).nth(0).click();

// ✅ Or add data-testid to component
await page.locator('[data-testid="delete-item-123"]').click();
```

### Problem: "Flaky tests" (pass sometimes, fail other times)

**Symptom:** Test passes locally, fails in CI. Or passes 3/5 runs.

**Common causes:**

1. **Race condition with network**
   ```typescript
   // ❌ Doesn't wait for API
   await page.click('button');
   await expect(page.locator('text=Success')).toBeVisible();

   // ✅ Wait for network
   await page.click('button');
   await page.waitForLoadState('networkidle');
   await expect(page.locator('text=Success')).toBeVisible();
   ```

2. **Hard-coded waits**
   ```typescript
   // ❌ Depends on speed
   await page.waitForTimeout(1000);

   // ✅ Wait for condition
   await expect(page.locator('text=Loaded')).toBeVisible({ timeout: 5000 });
   ```

3. **Random test data conflicts**
   ```typescript
   // ✅ Use unique identifiers
   const uniqueId = Date.now();
   await page.fill('input', `Test Item ${uniqueId}`);
   ```

4. **Mobile Safari slower than desktop**
   ```typescript
   test('slow feature', async ({ page, browserName }) => {
     const timeout = browserName === 'webkit' ? 60000 : 30000;
     test.setTimeout(timeout);
     await page.goto('/feature');
   });
   ```

### Problem: "Click didn't work" or "Form not submitted"

**Symptom:** Click executes but action doesn't happen.

**Causes & Solutions:**

1. **Element not visible**
   ```typescript
   // ✅ Verify element is visible before clicking
   await expect(page.getByRole('button')).toBeVisible();
   await page.getByRole('button').click();
   ```

2. **Click happens before JavaScript ready**
   ```typescript
   // ✅ Wait for page to load
   await page.waitForLoadState('networkidle');
   await page.getByRole('button').click();
   ```

3. **Click intercepted by overlay**
   ```typescript
   // ✅ Close modal first or force click
   const modal = page.locator('[role="dialog"]');
   if (await modal.isVisible()) {
     await page.keyboard.press('Escape');
   }
   await page.getByRole('button').click();
   ```

4. **Button has complex event handlers**
   ```typescript
   // ✅ Use waitForNavigation if button navigates
   await Promise.all([
     page.waitForNavigation(),
     page.getByRole('button', { name: 'Go' }).click()
   ]);
   ```

### Problem: "Page didn't navigate"

**Symptom:**
```
Error: page.waitForNavigation: Timeout 30000ms exceeded.
```

**Cause:** Button click didn't trigger navigation.

**Solutions:**

1. **Verify navigation actually happens**
   ```typescript
   // ✅ Check where navigation goes
   const response = await page.waitForNavigation();
   console.log('Navigated to:', page.url());
   console.log('Status:', response?.status());
   ```

2. **Navigation might be delayed**
   ```typescript
   // ✅ Wait longer or use goto directly
   await Promise.all([
     page.waitForNavigation({ waitUntil: 'networkidle' }),
     page.getByRole('button').click()
   ]);
   ```

3. **Might be client-side routing, not page.goto()**
   ```typescript
   // ✅ Wait for URL change, not full navigation
   await page.getByRole('button').click();
   await page.waitForURL(/\/next-page/);
   ```

### Problem: "localStorage value not persisted"

**Symptom:**
```typescript
const value = await page.evaluate(() => localStorage.getItem('key'));
expect(value).toBe('expected');  // Returns null
```

**Cause:** localStorage not set in beforeEach.

**Solution:**
```typescript
test.beforeEach(async ({ page }) => {
  // ✅ Set BEFORE navigating
  await page.addInitScript(() => {
    localStorage.setItem('key', 'value');
  });

  // ✅ THEN navigate
  await page.goto('/');
});

// ✅ Or set after initial navigation
await page.goto('/');
await page.evaluate(() => {
  localStorage.setItem('key', 'value');
});
```

### Problem: "Console errors in test"

**Symptom:**
```
✗ No console errors should occur
```

**Cause:** App logging errors during test.

**Solutions:**

1. **Ignore expected/benign errors**
   ```typescript
   page.on('console', msg => {
     // Ignore third-party warnings
     if (msg.text().includes('FB')) return;
     if (msg.type() === 'warning') return;

     // Fail on actual errors
     if (msg.type() === 'error') {
       throw new Error(`Console error: ${msg.text()}`);
     }
   });
   ```

2. **Fix the actual error**
   ```typescript
   // Inspect error
   page.on('console', msg => {
     console.log(`${msg.type()}: ${msg.text()}`);
   });

   // Then fix in source code
   ```

---

## CI/CD Issues

### Problem: "Tests pass locally, fail in CI"

**Causes:**

1. **Environment variables missing**
   ```bash
   # Verify .env.local has all required variables
   cat .env.local
   echo "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
   ```

2. **Different Node version**
   ```bash
   # Check CI uses same Node version
   node --version
   # Add to .nvmrc or CI config
   ```

3. **Build not running in CI**
   ```bash
   # CI should run build before tests
   npm run build
   npm run test:e2e
   ```

4. **Mobile device emulation issues**
   ```bash
   # Mobile tests may be stricter
   # Skip mobile in CI, run locally:
   npx playwright test --project=chromium
   ```

### Problem: "Playwright version mismatch"

**Symptom:**
```
Error: browserType.launch: Browser is not compatible with this version of Playwright
```

**Solution:**
```bash
# Reinstall browsers
npx playwright install

# Or specific browser
npx playwright install chromium
```

---

## Performance Issues

### Problem: "Smoke test takes >15 seconds"

**Cause:** Network slow or server overloaded.

**Solutions:**

1. **Increase timeout in smoke test**
   ```javascript
   signal: AbortSignal.timeout(15_000),  // 15 seconds
   ```

2. **Profile production**
   ```bash
   npm run test:smoke:prod 2>&1 | grep "duration"
   ```

3. **Check if Vercel deployment is stalled**
   ```bash
   vercel logs scentral-hub
   ```

### Problem: "E2E tests take 3+ minutes"

**Cause:** Too many tests or slow startup.

**Solutions:**

1. **Run in parallel (default)**
   ```typescript
   // playwright.config.ts already set to parallel
   workers: process.env.CI ? 1 : undefined,  // 1 in CI, auto in dev
   ```

2. **Skip slow tests in CI**
   ```typescript
   test.skip(process.env.CI === 'true', 'Skip in CI');
   ```

3. **Reduce browser coverage in CI**
   ```typescript
   projects: process.env.CI
     ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
     : [/* all browsers */]
   ```

---

## Debugging Tools

### Enable Debug Mode

```bash
# Step through test interactively
npx playwright test e2e/test.spec.ts --debug

# Or with specific browser
npx playwright test --debug --project=chromium
```

### Inspect Page in Debug Mode

```typescript
// In test:
test.only('debug this test', async ({ page }) => {
  await page.goto('/');

  // Pause here, inspect in browser debugger
  await page.pause();

  // Continue test
  await page.getByText('Button').click();
});
```

### Print Debug Info

```typescript
// Log page state
console.log('URL:', page.url());
console.log('Title:', await page.title());

// Screenshot on failure
await page.screenshot({ path: 'debug.png' });

// Print HTML
console.log(await page.content());
```

### Trace Recordings

```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry',  // Record trace on first failure
}

// View trace
npx playwright show-trace trace.zip
```

---

## Quick Reference: Common Fixes

| Problem | Quick Fix |
|---------|-----------|
| Test timeout | Start `npm run dev` separately |
| Element not found | Use `--debug` to inspect page |
| Flaky tests | Add `waitForLoadState('networkidle')` |
| Mobile test slow | Run locally, skip in CI |
| Console errors | Use `page.on('console')` to filter noise |
| localStorage not set | Call `addInitScript` BEFORE `goto` |
| Click didn't work | Add `waitForLoadState` before click |
| Test passes locally, fails in CI | Check env vars, Node version, build |
