import { test, expect } from '@playwright/test';

test.describe('Shelf Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });

  test('shows the signed-out shelf and routes sign in to login', async ({ page }) => {
    await page.goto('/shelf');

    await expect(page.getByText('Your shelf is waiting.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Sign in to build your Top 20')).toBeVisible();

    await page.getByRole('link', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/login\?next=(%2F|\/)shelf$/);
    await expect(page.getByText('Come back to your shelf.')).toBeVisible({ timeout: 10_000 });
  });

  test('bottom nav routes Read to the login flow', async ({ page }) => {
    await page.goto('/shelf');

    await page.getByRole('link', { name: 'Read' }).evaluate(el => (el as HTMLAnchorElement).click());

    await expect(page).toHaveURL(/\/login\?next=(%2F|\/)read$/);
    await expect(page.getByText('Your identity is waiting.')).toBeVisible({ timeout: 10_000 });
  });
});
