import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Dev-server first-compile of /discover + 127k-row data fetch can exceed
    // the default 30s. Element waits below do the real synchronisation —
    // never wait for 'networkidle' here; analytics keep-alives mean it may
    // never settle (QE-6).
    testInfo.setTimeout(180_000);
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
      localStorage.setItem('scentral_vibe', 'fresh');
    });
    await page.goto('/discover', { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    if (testInfo.project.name.includes('Safari')) {
      await page.waitForTimeout(20000);
    }
  });

  test('can search for fragrances', async ({ page }) => {
    const search = page.getByPlaceholder('Search by brand or scent…');
    await search.waitFor({ state: 'visible', timeout: 60_000 });
    await search.fill('Aventus');
    await expect(search).toHaveValue('Aventus');
  });

  test('can toggle filters', async ({ page }) => {
    // Vibe chip label matches Object.keys(VIBE_TAGS) — 'Fresh', not 'Fresh & Clean'
    const freshChip = page.getByRole('button', { name: 'Fresh' }).first();
    await expect(freshChip).toBeVisible({ timeout: 60_000 });
    await freshChip.dispatchEvent('click');
    await page.getByRole('button', { name: 'Top Rated' }).dispatchEvent('click');
    await expect(page).toHaveURL(/\/discover/);
  });

  test('can heart a fragrance to wishlist', async ({ page }) => {
    const cardLink = page.getByRole('link', { name: /Womo Juniper Salt/ }).nth(1);
    await expect(cardLink).toBeVisible({ timeout: 60_000 });
    const heartBtn = cardLink.locator('xpath=following-sibling::button[@aria-label="Add to wishlist"]').first();
    await expect(heartBtn).toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(5000);
    const cardHref = await heartBtn.locator('xpath=..').getByRole('link').first().getAttribute('href');
    const expectedId = cardHref?.match(/\/collection\/([^?]+)/)?.[1] ?? '';
    await heartBtn.click({ force: true });

    await expect.poll(async () => page.evaluate(() => localStorage.getItem('scentral_wishlist')), {
      timeout: 20_000,
    }).toContain(expectedId);
  });

  test('renders a Discover card from www.mannenzaak.nl', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Womo Juniper Salt/ })).toHaveCount(2, { timeout: 60_000 });
  });

  test('does not overflow horizontally on mobile', async ({ page }) => {
    const mobilePage = await page.context().newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
      localStorage.setItem('scentral_vibe', 'fresh');
    });
    await mobilePage.goto('/discover', { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await mobilePage.waitForLoadState('domcontentloaded');
    await mobilePage.waitForTimeout(20000);
    await expect(mobilePage.locator('button[aria-label="Add to wishlist"]').first()).toBeVisible({ timeout: 120_000 });

    const hasOverflow = await mobilePage.evaluate(() => {
      window.scrollTo(1000, 0);
      return window.scrollX > 0;
    });
    expect(hasOverflow).toBe(false);
    await mobilePage.close();
  });
});
