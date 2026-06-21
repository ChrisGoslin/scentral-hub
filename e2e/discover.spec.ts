import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set onboarding as complete to avoid redirects
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
      localStorage.setItem('scentral_vibe', 'fresh');
    });
  });

  test('can search for fragrances', async ({ page }) => {
    // ARRANGE
    await page.goto('/discover');

    // ACT
    await page.getByPlaceholder('Search by brand or scent…').fill('Aventus');
    await page.waitForLoadState('networkidle');

    // ASSERT
    await expect(page.locator('p').filter({ hasText: /\d+ fragrances?/ }).first()).toBeVisible();
  });

  test('can toggle filters', async ({ page }) => {
    await page.goto('/discover');
    
    // Toggle Feel
    await page.getByText('Fresh & Clean').first().click();
    await expect(page.locator('p').filter({ hasText: /fragrances •/ }).first()).toBeVisible(); // Should update count
    
    // Toggle Sort
    await page.getByText('Top Rated').click();
    const currentSort = await page.evaluate(() => localStorage.getItem('scentral_discover_sort'));
    expect(currentSort).toBe('Top Rated');
  });

  test('can heart a fragrance to wishlist', async ({ page }) => {
    await page.goto('/discover');
    
    // Find first heart button
    const heartBtn = page.locator('button[aria-label="Add to wishlist"]').first();
    await heartBtn.click();
    
    const wishlist = await page.evaluate(() => localStorage.getItem('scentral_wishlist'));
    expect(wishlist).not.toBeNull();
    expect(JSON.parse(wishlist!).length).toBe(1);
  });
});
