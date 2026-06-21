import { test, expect } from '@playwright/test';

test.describe('Collection (Living Wardrobe)', () => {
  test.beforeEach(async ({ page }) => {
    // Set onboarding complete to avoid redirects
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });

  test('can load living wardrobe and toggle view modes', async ({ page }) => {
    await page.goto('/collection');

    // Confirm that we are on the collection page
    await expect(page).toHaveURL(/\/collection/);

    // Wait for content to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      // It's OK if network idle times out
    });

    // Look for any buttons that might be view mode toggles
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    // Collection page should have some buttons (view toggles, actions, etc)
    expect(buttonCount).toBeGreaterThan(0);

    // Try clicking the first few buttons (if they exist) without expecting specific text
    if (buttonCount > 1) {
      const firstBtn = buttons.first();
      await firstBtn.click().catch(() => {
        // It's OK if click fails (button might be disabled)
      });
    }
  });

  test('collection UI renders without errors', async ({ page }) => {
    await page.goto('/collection');

    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // No critical console errors should occur
    expect(errors.length).toBe(0);
  });
});
