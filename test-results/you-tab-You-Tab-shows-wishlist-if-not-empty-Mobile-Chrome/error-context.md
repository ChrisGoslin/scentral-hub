# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: you-tab.spec.ts >> You Tab >> shows wishlist if not empty
- Location: e2e/you-tab.spec.ts:21:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=WISHLIST')
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('text=WISHLIST')

```

```yaml
- main:
  - main:
    - heading "You" [level=1]
    - heading "See your scent profile." [level=2]
    - paragraph: Sign in to track what you wear, save combinations, and see patterns in your collection.
    - paragraph: THIS WEEK
    - paragraph: Lattafa Asad
    - paragraph: Most reached for · 4 wears
    - paragraph: STREAK
    - paragraph: 7 days
    - paragraph: You've worn something every day this week
    - paragraph: SAVED
    - paragraph: 3 combinations
    - paragraph: Asad → Bade'e Al Oud · Office · 2 days ago
    - button "Sign in to see yours"
    - paragraph:
      - text: No account needed to browse —
      - link "Explore scents →":
        - /url: /discover
  - navigation:
    - link "Discover":
      - /url: /discover
    - link "My Bottles":
      - /url: /collection
    - link "Layering":
      - /url: /layering
    - link "You":
      - /url: /you
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('You Tab', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.evaluate(() => {
  7  |       localStorage.setItem('scentral_onboarded', 'true');
  8  |     });
  9  |   });
  10 | test('shows signed-out state with teaser cards', async ({ page }) => {
  11 |   await page.goto('/you');
  12 |   await expect(page.locator('text=See your scent profile.')).toBeVisible();
  13 |   await expect(page.getByRole('button', { name: 'Sign in to see yours' })).toBeVisible();
  14 | 
  15 |   // Check for teaser card content with exact match to avoid subtext conflicts
  16 |   await expect(page.getByText('THIS WEEK', { exact: true })).toBeVisible();
  17 |   await expect(page.getByText('STREAK', { exact: true })).toBeVisible();
  18 |   await expect(page.getByText('SAVED', { exact: true })).toBeVisible();
  19 | });
  20 | 
  21 | test('shows wishlist if not empty', async ({ page }) => {
  22 |   // Inject a wishlist item
  23 |   const testId = '0b84f3c0-379e-4b77-834c-20e3636f018e'; // Lattafa Asad ID
  24 |   await page.goto('/');
  25 |   await page.evaluate((id) => {
  26 |     localStorage.setItem('scentral_onboarded', 'true');
  27 |     localStorage.setItem('scentral_wishlist', JSON.stringify([id]));
  28 |   }, testId);
  29 | 
  30 |   await page.goto('/you');
  31 |   // More patient check for any wishlist indicator
> 32 |   await expect(page.locator('text=WISHLIST')).toBeVisible({ timeout: 20000 });
     |                                               ^ Error: expect(locator).toBeVisible() failed
  33 | });
  34 | });
  35 | 
```