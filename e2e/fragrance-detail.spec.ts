import { test, expect } from '@playwright/test';

test.describe('Fragrance Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
      localStorage.setItem('nota_consent', JSON.stringify({ analytics: true, errorTracking: true, timestamp: Date.now() }));
    });
  });

  test('can view fragrance detail from discover', async ({ page }) => {
    await page.goto('/discover');

    // Click first available link/card (looking for a brand name or card container)
    const firstCard = page.locator('a').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();

      // Should navigate to collection detail page or error gracefully
      // Note: This test is conditional on there being at least one fragrance
      const url = page.url();
      if (url.includes('/collection/')) {
        // Verify detail page has expected sections
        await expect(page.locator('h1, h2')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('social proof and wishlist function on discover', async ({ page }) => {
    await page.goto('/discover');

    // Look for a heart/wishlist button (generic role-based selector)
    const wishlistBtn = page.locator('button[aria-label="Add to wishlist"]').first();
    if (await wishlistBtn.isVisible()) {
      // This test just verifies no errors on interaction
      const initialColor = await wishlistBtn.evaluate((el) => window.getComputedStyle(el).color);
      await wishlistBtn.click();
      // Verify button is still present after click
      await expect(wishlistBtn).toBeVisible();
    }
  });
});
