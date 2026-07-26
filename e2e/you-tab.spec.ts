import { test, expect } from '@playwright/test';

test.describe('You Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });
test('shows signed-out state with identity prompt', async ({ page }) => {
  await page.goto('/you');
  // No persona set: signed-out state shows identity quiz prompt
  await expect(page.locator('text=Your dossier is waiting.')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('link', { name: /Find Your Base Note/i })).toBeVisible();
});

test('shows wishlist if not empty', async ({ page }) => {
  // Mock Supabase Auth and Database routes in browser
  await page.route('**/auth/v1/user**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
      }),
    })
  });

  await page.route('**/rest/v1/fragrances**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: '0b84f3c0-379e-4b77-834c-20e3636f018e',
          brand: 'Lattafa',
          name: 'Asad',
          image_url: null,
        }
      ]),
    })
  });

  await page.route('**/rest/v1/collections**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  });

  await page.route('**/rest/v1/wear_logs**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  });

  // Inject a wishlist item
  const testId = '0b84f3c0-379e-4b77-834c-20e3636f018e'; // Lattafa Asad ID
  const appUrl = 'http://127.0.0.1:3100'

  // Set mock Supabase SSR cookie to simulate being signed in on the server
  await page.context().addCookies([
    {
      name: 'sb-lrkdwobnemczvhpixpky-auth-token',
      value: JSON.stringify(['fake-access-token', 'fake-refresh-token', null, null]),
      url: appUrl,
    },
    {
      name: 'fake-session',
      value: 'true',
      url: appUrl,
    }
  ]);

  // Set mock Supabase client-side session in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('scentral_onboarded', 'true');
    localStorage.setItem('sb-lrkdwobnemczvhpixpky-auth-token', JSON.stringify({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      user: { id: 'test-user-id', email: 'test@example.com' },
      expires_at: Math.floor(Date.now() / 1000) + 3600
    }));
  });

  await page.goto('/');
  await page.evaluate((id) => {
    localStorage.setItem('scentral_wishlist', JSON.stringify([id]));
  }, testId);

  await page.goto('/you');
  // More patient check for any wishlist indicator
  await expect(page.locator('text=MY WISHLIST')).toBeVisible({ timeout: 20000 });
});
});
