import { test, expect } from '@playwright/test';

test.describe('You Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
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

  // Set mock Supabase SSR cookie to simulate being signed in on the server
  await page.context().addCookies([
    {
      name: 'sb-lrkdwobnemczvhpixpky-auth-token',
      value: JSON.stringify(['fake-access-token', 'fake-refresh-token', null, null]),
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'fake-session',
      value: 'true',
      domain: 'localhost',
      path: '/'
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
