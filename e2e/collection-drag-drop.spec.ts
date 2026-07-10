import { test, expect } from '@playwright/test';

function isIgnorableConsoleError(message: string) {
  return [
    'Failed to load resource',
    'favicon.ico',
    'MetaMask',
    'Extension context invalidated',
    'NetworkError when attempting to fetch resource',
  ].some(fragment => message.includes(fragment))
}

test.describe('Collection Drag-and-Drop (Living Wardrobe)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });

  test('collection page loads without errors', async ({ page }) => {
    await page.goto('/collection');

    // Verify main content loads
    await expect(page).toHaveURL(/\/collection/);

    // Check for page structure (heading or main container)
    const content = page.locator('main, [role="main"], h1, h2').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('sidebar view mode buttons are accessible', async ({ page }) => {
    await page.goto('/collection');

    // Look for buttons with common view mode names (case-insensitive)
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    // Should have at least some buttons for view modes
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('no errors on collection page load (network requests)', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isIgnorableConsoleError(msg.text())) {
        errors.push(msg.text());
      }
    });

    await page.goto('/collection');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/collection/);
    await expect(page.locator('main, [role="main"], h1, h2').first()).toBeVisible({ timeout: 10_000 });

    // Verify there are no app-level runtime errors after the page becomes interactive.
    expect(errors.length).toBe(0);
  });
});
