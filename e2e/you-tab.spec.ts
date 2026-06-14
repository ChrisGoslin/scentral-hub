import { test, expect } from '@playwright/test';

test.describe('You Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });
test('shows signed-out state with teaser cards', async ({ page }) => {
  await page.goto('/you');
  await expect(page.locator('text=See your scent profile.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in to see yours' })).toBeVisible();

  // Check for teaser card content with exact match to avoid subtext conflicts
  await expect(page.getByText('THIS WEEK', { exact: true })).toBeVisible();
  await expect(page.getByText('STREAK', { exact: true })).toBeVisible();
  await expect(page.getByText('SAVED', { exact: true })).toBeVisible();
});

test('shows wishlist if not empty', async ({ page }) => {
  // Inject a wishlist item
  const testId = '0b84f3c0-379e-4b77-834c-20e3636f018e'; // Lattafa Asad ID
  await page.goto('/');
  await page.evaluate((id) => {
    localStorage.setItem('scentral_onboarded', 'true');
    localStorage.setItem('scentral_wishlist', JSON.stringify([id]));
  }, testId);

  await page.goto('/you');
  // More patient check for any wishlist indicator
  await expect(page.locator('text=WISHLIST')).toBeVisible({ timeout: 20000 });
});
});
