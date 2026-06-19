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

    // Sidebar view modes should be visible (we select by text or first matching button)
    await expect(page.getByRole('button', { name: 'All' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'By House' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Season' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Wishlist' }).first()).toBeVisible();

    // Toggle to By House
    await page.getByRole('button', { name: 'By House' }).first().click();
    
    // Toggle to By Season
    await page.getByRole('button', { name: 'By Season' }).first().click();

    // Toggle to Wishlist
    await page.getByRole('button', { name: 'Wishlist' }).first().click();
  });

  test('can activate sensory lenses', async ({ page }) => {
    await page.goto('/collection');

    // Sensory lenses like "Comfort" or "Executive" should be toggleable in the sidebar/strip
    const comfortLensBtn = page.getByRole('button', { name: /Comfort/i }).first();
    await expect(comfortLensBtn).toBeVisible();
    await comfortLensBtn.click();
    
    const execLensBtn = page.getByRole('button', { name: /Executive/i }).first();
    await expect(execLensBtn).toBeVisible();
    await execLensBtn.click();
  });
});
