# E2E Test Patterns & Anti-Patterns

## Selector Strategies

### Pattern: Use Stable Selectors (Recommended)

```typescript
// ✅ GOOD: Role-based selectors
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('heading', { level: 1 }).toContainText('Welcome');

// ✅ GOOD: Text-based selectors
await page.getByText('Sign in').click();
await expect(page.getByText(/results found/i)).toBeVisible();

// ✅ GOOD: Label-based for forms
await page.getByLabel('Email address').fill('test@example.com');

// ✅ GOOD: Placeholder for empty inputs
await page.getByPlaceholder('Search...').fill('query');
```

### Anti-Pattern: Brittle Selectors

```typescript
// ❌ BAD: Changes with styling refactors
await page.locator('.btn-primary.mt-2.px-4').click();

// ❌ BAD: Relies on implementation details
await page.locator('div > div > button:nth-child(3)').click();

// ❌ BAD: Changes with content updates
await page.locator('text=Click here for info').click();  // What if copy changes?
```

### When to Add data-testid

Only add `data-testid` when:
- Testing multiple identical elements (e.g., list items)
- Element lacks stable accessible name
- Text content is dynamic or changes frequently

```typescript
// Add to component:
<button data-testid="save-confirmation">Save Draft</button>

// Use in test:
await page.locator('[data-testid="save-confirmation"]').click();
```

## Async Operation Patterns

### Pattern: Wait for Page Load

```typescript
// ✅ Wait for network idle (page fully loaded)
await page.waitForLoadState('networkidle');

// ✅ Wait for specific element to appear
await expect(page.locator('text=Results')).toBeVisible({ timeout: 3000 });

// ✅ Wait for DOM update after action
await page.click('button[aria-label="Sort"]');
await page.waitForLoadState('domcontentloaded');
```

### Anti-Pattern: Fixed Waits

```typescript
// ❌ BAD: Fixed wait time
await page.waitForTimeout(2000);  // Why 2 seconds? What if it takes 3?

// ❌ BAD: Unreliable timing
await page.click('button');
await page.waitForTimeout(500);
await page.fill('input', 'text');  // May fail if click hasn't processed
```

### Pattern: Wait for Navigation

```typescript
// ✅ Navigate and wait for destination
Promise.all([
  page.waitForNavigation(),
  page.click('text=Go to next page')
]);
await expect(page).toHaveURL(/\/next-page/);

// ✅ Or use goto with explicit wait
await page.goto('/page', { waitUntil: 'networkidle' });
```

## Setup & Teardown Patterns

### Pattern: Fixture for Common Setup

```typescript
test.beforeEach(async ({ page }) => {
  // Set up state before each test
  await page.addInitScript(() => {
    localStorage.setItem('user_id', 'test-123');
    localStorage.setItem('onboarded', 'true');
  });

  // Navigate to starting point
  await page.goto('/discover');
});

test.afterEach(async ({ page }) => {
  // Clean up after each test
  await page.context().clearCookies();
});
```

### Pattern: API Mocking

```typescript
test('error handling', async ({ page }) => {
  // Mock API to return error
  await page.route('**/api/search', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' })
    });
  });

  await page.goto('/discover');
  await page.getByPlaceholder('Search').fill('query');

  // Verify error is handled gracefully
  await expect(page.getByText('Something went wrong')).toBeVisible();
});

// Unmock after test (automatic with route scope)
```

## Mobile Testing Patterns

### Pattern: Mobile Device Emulation

```typescript
test.use({ 
  ...devices['iPhone 12'],
  baseURL: 'http://localhost:3000'
});

test('mobile navigation', async ({ page }) => {
  await page.goto('/');

  // Test mobile-specific behavior
  const isMobile = await page.evaluate(() => window.innerWidth < 480);
  expect(isMobile).toBe(true);

  // Test touch-friendly targets (44px minimum)
  const button = page.getByRole('button').first();
  const box = await button.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
```

### Pattern: Responsive Breakpoint Testing

```typescript
const breakpoints = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

for (const bp of breakpoints) {
  test(`layout at ${bp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/');

    // Test layout-specific behaviors
    const nav = page.locator('nav');
    if (bp.width < 768) {
      await expect(nav).toHaveClass(/mobile-nav/);
    }
  });
}
```

## AAA Pattern (Arrange-Act-Assert)

### Recommended Structure

```typescript
test('user can search and filter', async ({ page }) => {
  // ARRANGE: Set up preconditions
  await page.addInitScript(() => {
    localStorage.setItem('onboarded', 'true');
  });

  // ACT: Perform the action
  await page.goto('/discover');
  await page.getByPlaceholder('Search...').fill('Aventus');
  await page.waitForLoadState('networkidle');

  // ASSERT: Verify expected outcome
  await expect(page.locator('text=Creed Aventus')).toBeVisible();
  const results = await page.locator('[data-testid="result"]').count();
  expect(results).toBeGreaterThan(0);
});
```

## Error Handling Patterns

### Pattern: Graceful Test Failures

```typescript
test('optional feature (if available)', async ({ page }) => {
  await page.goto('/');

  // Test only if feature exists
  const featureBtn = page.getByRole('button', { name: /Beta Feature/i });
  if (await featureBtn.isVisible().catch(() => false)) {
    await featureBtn.click();
    await expect(page.getByText(/Feature content/)).toBeVisible();
  }
  // If feature doesn't exist, test passes (feature is optional)
});

// Ignore expected errors
page.on('console', msg => {
  if (!msg.text().includes('Expected error')) {
    console.log(msg);
  }
});
```

### Anti-Pattern: Brittle Error Handling

```typescript
// ❌ BAD: Fails entire test if optional element missing
await expect(page.getByText('Optional badge')).toBeVisible();

// ❌ BAD: Silent failures (test passes but did nothing)
try {
  await page.click('text=Nonexistent button');
  // No assertion = silent failure
}
```

## Data Isolation Patterns

### Pattern: Test-Specific Data

```typescript
test('user can save preferences', async ({ page }) => {
  const testId = `test-${Date.now()}`;
  
  // Use unique identifiers to avoid test conflicts
  await page.goto('/');
  await page.getByPlaceholder('ID').fill(testId);
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify saved
  const saved = await page.evaluate((id) => {
    return localStorage.getItem(`user-${id}`);
  }, testId);
  expect(saved).toBeTruthy();

  // Cleanup
  await page.evaluate((id) => {
    localStorage.removeItem(`user-${id}`);
  }, testId);
});
```

## Performance Testing Patterns

### Pattern: Measure Load Time

```typescript
test('page loads within performance budget', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/discover', { waitUntil: 'networkidle' });
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);  // 3 second budget

  // Also measure First Contentful Paint
  const fcp = await page.evaluate(() => {
    const perfEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return perfEntry?.startTime || 0;
  });
  expect(fcp).toBeLessThan(1500);  // 1.5s FCP budget
});
```

## Accessibility Testing Patterns

### Pattern: Keyboard Navigation

```typescript
test('form is keyboard accessible', async ({ page }) => {
  await page.goto('/form');

  // Tab through form fields
  await page.keyboard.press('Tab');
  await expect(page.locator('input[type="email"]')).toBeFocused();

  // Fill with keyboard
  await page.keyboard.type('test@example.com');
  await page.keyboard.press('Tab');
  await page.keyboard.type('password123');

  // Submit with keyboard
  await page.keyboard.press('Tab');  // Move to submit button
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/success/);
});
```

### Pattern: Check Focus Indicators

```typescript
test('focus indicators visible', async ({ page }) => {
  await page.goto('/');

  // Tab to button
  await page.keyboard.press('Tab');

  // Check focus outline is visible
  const button = page.getByRole('button').first();
  const styles = await button.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      outline: computed.outline,
      boxShadow: computed.boxShadow,
      border: computed.border
    };
  });

  // Should have some visible focus indicator
  const hasFocus = styles.outline !== 'none' || styles.boxShadow !== 'none' || styles.border !== 'none';
  expect(hasFocus).toBe(true);
});
```

## Test Reporting Patterns

### Pattern: Custom Report Output

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    // Capture debug info on failure
    const screenshot = await page.screenshot({ path: `failure-${testInfo.title}.png` });
    const html = await page.content();
    
    console.log(`Test failed: ${testInfo.title}`);
    console.log(`Screenshot: failure-${testInfo.title}.png`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
  }
});
```

## Common Gotchas & Solutions

### Gotcha: Page Doesn't Wait for JavaScript

```typescript
// ❌ May fail if JS hasn't run yet
await page.goto('/');
await expect(page.locator('text=Dynamic content')).toBeVisible();

// ✅ Wait for rendering to complete
await page.goto('/', { waitUntil: 'networkidle' });
await page.waitForLoadState('domcontentloaded');
await expect(page.locator('text=Dynamic content')).toBeVisible();
```

### Gotcha: Locator Returns Multiple Elements

```typescript
// ❌ Ambiguous which button to click
await page.getByRole('button', { name: 'Delete' }).click();  // Multiple delete buttons!

// ✅ Be specific
await page.getByRole('row', { name: 'Item name' }).getByRole('button', { name: 'Delete' }).click();
```

### Gotcha: Modal Dialog Traps Focus

```typescript
// ✅ Handle modal focus properly
test('modal accessible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open modal' }).click();

  // Focus should be in modal
  await expect(page.locator('[role="dialog"]')).toBeFocused();

  // Tab should cycle within modal
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'));
  expect(focused === 'dialog' || focused === 'button').toBe(true);
});
```
