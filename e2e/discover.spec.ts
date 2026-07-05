import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Dev-server first-compile of /discover + 127k-row data fetch can exceed
    // the default 30s. Element waits below do the real synchronisation —
    // never wait for 'networkidle' here; analytics keep-alives mean it may
    // never settle (QE-6).
    testInfo.setTimeout(90_000);
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
      localStorage.setItem('scentral_vibe', 'fresh');
    });
    await page.goto('/discover');
  });

  test('can search for fragrances', async ({ page }) => {
    const search = page.getByPlaceholder('Search by brand or scent…');
    await expect(search).toBeVisible({ timeout: 60_000 });
    await search.fill('Aventus');
    await expect(
      page.locator('p').filter({ hasText: /\d+ fragrances?/ }).first()
    ).toBeVisible({ timeout: 30_000 });
  });

  test('can toggle filters', async ({ page }) => {
    // Vibe chip label matches Object.keys(VIBE_TAGS) — 'Fresh', not 'Fresh & Clean'
    const freshChip = page.getByText('Fresh').first();
    await expect(freshChip).toBeVisible({ timeout: 60_000 });
    await freshChip.click();
    // Sort localStorage persists regardless of count display
    await page.getByText('Top Rated').click();
    const currentSort = await page.evaluate(() => localStorage.getItem('scentral_discover_sort'));
    expect(currentSort).toBe('Top Rated');
  });

  test('can heart a fragrance to wishlist', async ({ page }) => {
    const heartBtn = page.locator('button[aria-label="Add to wishlist"]').first();
    await expect(heartBtn).toBeVisible({ timeout: 60_000 });
    await heartBtn.click();

    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('scentral_wishlist')))
      .not.toBeNull();
    const wishlist = await page.evaluate(() => localStorage.getItem('scentral_wishlist'));
    expect(JSON.parse(wishlist!).length).toBe(1);
  });

  test('renders a Discover card from www.mannenzaak.nl', async ({ page }) => {
    const hostImage = page.locator('img[src*="www.mannenzaak.nl"]').first();
    await expect(hostImage).toBeVisible({ timeout: 60_000 });
  });
});
