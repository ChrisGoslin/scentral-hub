import { test, expect } from '@playwright/test';

test.describe('Example Feature Tests', () => {
  /**
   * SETUP: Run before each test
   * Set up common preconditions (localStorage, API mocks, navigation)
   */
  test.beforeEach(async ({ page }) => {
    // Set localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem('app_onboarded', 'true');
      localStorage.setItem('user_preferences', JSON.stringify({
        theme: 'light',
        language: 'en'
      }));
    });

    // Navigate to starting point
    await page.goto('/');
  });

  /**
   * TEST 1: Search functionality (AAA Pattern)
   *
   * ARRANGE: Set up preconditions
   * ACT: Perform user actions
   * ASSERT: Verify expected outcomes
   */
  test('user can search for items', async ({ page }) => {
    // ARRANGE
    await page.goto('/discover');

    // ACT
    const searchInput = page.getByPlaceholder('Search...');
    await searchInput.fill('test query');
    await page.waitForLoadState('networkidle');

    // ASSERT
    const results = page.locator('[data-testid="result-item"]');
    await expect(results.first()).toBeVisible();

    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThan(0);
  });

  /**
   * TEST 2: Navigation and page transitions
   * Verify that user can navigate between pages
   */
  test('user can navigate between pages', async ({ page }) => {
    // Navigate by clicking a link
    await page.getByRole('link', { name: 'Features' }).click();

    // Wait for navigation and verify URL changed
    await expect(page).toHaveURL(/\/features/);

    // Verify page content loaded
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  /**
   * TEST 3: Form submission
   * Test filling out and submitting a form
   */
  test('user can submit form', async ({ page }) => {
    // ARRANGE: Navigate to form
    await page.goto('/contact');

    // ACT: Fill form fields
    await page.getByLabel('Name').fill('John Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByLabel('Message').fill('Hello world');

    // ACT: Submit form
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'Submit' }).click()
    ]);

    // ASSERT: Verify success
    await expect(page).toHaveURL(/\/contact\/success/);
    await expect(page.getByText('Thank you')).toBeVisible();
  });

  /**
   * TEST 4: Error handling
   * Test that errors are handled gracefully
   * Uses API mocking to simulate error response
   */
  test('error is displayed when API fails', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/data', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    // Navigate to page that calls API
    await page.goto('/dashboard');

    // Verify error message appears
    await expect(page.getByText(/something went wrong/i)).toBeVisible({ timeout: 3000 });
  });

  /**
   * TEST 5: Data persistence
   * Verify that data is saved and persists across sessions
   */
  test('user preferences are persisted', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings');

    // ARRANGE: Change preference
    await page.getByLabel('Theme').selectOption('dark');

    // ACT: Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for save confirmation
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 2000 });

    // ASSERT: Verify localStorage updated
    const preferences = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('user_preferences') || '{}');
    });
    expect(preferences.theme).toBe('dark');

    // Reload page
    await page.reload();

    // ASSERT: Verify preference persisted
    const selectValue = await page.getByLabel('Theme').inputValue();
    expect(selectValue).toBe('dark');
  });

  /**
   * TEST 6: Keyboard navigation and accessibility
   * Verify keyboard access to all interactive elements
   */
  test('form is keyboard accessible', async ({ page }) => {
    // Navigate to form
    await page.goto('/form');

    // Tab to first input
    await page.keyboard.press('Tab');
    const firstInput = page.getByLabel('Name');
    await expect(firstInput).toBeFocused();

    // Fill with keyboard
    await page.keyboard.type('Jane Smith');

    // Tab to next input
    await page.keyboard.press('Tab');
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeFocused();

    // Continue filling
    await page.keyboard.type('jane@example.com');

    // Tab to submit button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeFocused();

    // Submit with keyboard
    await page.keyboard.press('Enter');

    // Verify submission
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 2000 });
  });

  /**
   * TEST 7: Mobile responsiveness
   * Test that layout adapts to mobile viewport
   * Note: Mobile viewport already set in playwright.config.ts for specific tests
   */
  test('mobile navigation works', async ({ page }) => {
    // Set mobile viewport size
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to home
    await page.goto('/');

    // Verify mobile menu exists and is accessible
    const mobileMenu = page.getByRole('button', { name: /menu|hamburger/i });
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();

      // Verify menu opened
      await expect(page.getByRole('navigation')).toBeVisible();

      // Verify can navigate via menu
      await page.getByRole('link', { name: 'About' }).click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  /**
   * TEST 8: Loading states
   * Verify loading indicators appear and disappear correctly
   */
  test('loading state shows during data fetch', async ({ page }) => {
    // Deliberately slow down network to capture loading state
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000);
    });

    // Navigate to page with loading
    await page.goto('/data');

    // Verify loading indicator appears
    await expect(page.locator('[aria-label="Loading"]')).toBeVisible({ timeout: 500 });

    // Wait for data
    await page.waitForLoadState('networkidle');

    // Verify loading indicator disappears
    await expect(page.locator('[aria-label="Loading"]')).not.toBeVisible();

    // Verify data appears
    await expect(page.locator('[data-testid="data-content"]')).toBeVisible();
  });

  /**
   * CLEANUP: Run after each test (optional)
   */
  test.afterEach(async ({ page }, testInfo) => {
    // Log test result for debugging
    if (testInfo.status !== 'passed') {
      console.log(`Test failed: ${testInfo.title}`);

      // Take screenshot for failed tests
      await page.screenshot({ path: `failure-${testInfo.title}.png` });
    }
  });
});

/**
 * SUITE 2: Optional feature tests
 * Only run if feature is available
 */
test.describe('Optional Beta Features', () => {
  test('beta feature works when enabled', async ({ page }) => {
    // Check if feature is available
    await page.goto('/settings');
    const betaToggle = page.getByLabel(/beta features/i);

    // Skip if feature doesn't exist
    if (!await betaToggle.isVisible().catch(() => false)) {
      test.skip();
    }

    // Test the feature
    await betaToggle.check();
    await page.goto('/beta-feature');

    await expect(page.getByText(/beta content/i)).toBeVisible();
  });
});

/**
 * BEST PRACTICES SUMMARY:
 *
 * ✅ DO:
 * - Use AAA pattern (Arrange, Act, Assert)
 * - Use getByRole() or getByText() for stable selectors
 * - Wait for conditions, not fixed timeouts
 * - Set localStorage in beforeEach BEFORE goto
 * - Mock APIs to control behavior
 * - Test user-visible behavior, not implementation
 *
 * ❌ DON'T:
 * - Use brittle selectors (nth-child, CSS specifics)
 * - Hardcode waits (waitForTimeout)
 * - Test implementation details
 * - Use data-testid for every element
 * - Skip error states (test error handling!)
 * - Leave tests in .only or .skip
 */
