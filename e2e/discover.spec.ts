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
    await page.goto('/discover');
    // Wait for client-side hydration — search input is in a client component
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    await page.getByPlaceholder('Search by brand or scent…').fill('Aventus');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('p').filter({ hasText: /\d+ fragrances?/ }).first()).toBeVisible();
  });

  test('can toggle filters', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Vibe chip label matches Object.keys(VIBE_TAGS) — 'Fresh', not 'Fresh & Clean'
    await page.getByText('Fresh').first().click();
    // Sort localStorage persists regardless of count display
    await page.getByText('Top Rated').click();
    const currentSort = await page.evaluate(() => localStorage.getItem('scentral_discover_sort'));
    expect(currentSort).toBe('Top Rated');
  });

  test('can heart a fragrance to wishlist', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    const heartBtn = page.locator('button[aria-label="Add to wishlist"]').first();
    await heartBtn.click();

    const wishlist = await page.evaluate(() => localStorage.getItem('scentral_wishlist'));
    expect(wishlist).not.toBeNull();
    expect(JSON.parse(wishlist!).length).toBe(1);
  });
});
