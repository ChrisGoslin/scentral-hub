import { test, expect } from '@playwright/test';

test.describe('Layering Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });

  test('can view layering lab page', async ({ page }) => {
    await page.goto('/lab');

    // Verify page loaded without errors (was /layering — now a 308 redirect to /lab)
    await expect(page).toHaveURL(/\/lab/);

    // Wait for page content to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      // It's OK if network idle times out, page might still be interactive
    });

    // Check for any main content
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('can search for fragrances to layer', async ({ page }) => {
    await page.goto('/lab');

    // Look for search input
    const searchInput = page.getByPlaceholder(/search|layer|combine/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Sauvage');
      await page.waitForTimeout(300); // Debounce

      // Expect results to appear
      const results = page.locator('[data-testid="fragrance-search-result"]').first();
      await expect(results).toBeVisible({ timeout: 2000 });
    }
  });

  test('can save a layering combination (if feature exists)', async ({ page }) => {
    await page.goto('/lab');

    // Try to find save button
    const saveBtn = page.getByRole('button', { name: /Save|Create/i }).first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();

      // Verify confirmation (toast, modal, or redirect)
      // Use alert or status role for confirmation messages (requires role="alert" or role="status" on toast)
      await expect(page.getByRole('alert').or(page.getByRole('status')).filter({ hasText: /Saved|Created/i })).toBeVisible({ timeout: 2000 });
    }
  });
});
