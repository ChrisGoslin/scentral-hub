import { test, expect } from '@playwright/test';

test.describe('You Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });
test('shows signed-out state with identity prompt', async ({ page }) => {
  await page.goto('/you');
  await expect(page).toHaveURL(/\/archive/);
  await expect(page.getByRole('heading', { name: /Your dossier is waiting/i })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('link', { name: /Begin your Read/i })).toBeVisible();
});

test('shows wishlist if not empty', async ({ page }) => {
  const supabaseCorsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
    'access-control-expose-headers': 'content-range',
  };

  // Mock Supabase Auth and Database routes in browser
  await page.route('**/auth/v1/user**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: supabaseCorsHeaders,
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
      }),
    })
  });

  // Match the PostgREST request explicitly (including its query string). The
  // broad glob was not reliable on the Linux CI browsers, so the test could
  // render a signed-in page while the wishlist query received an empty real
  // response.
  await page.route(/\/rest\/v1\/fragrances(?:\?|$)/, route => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: supabaseCorsHeaders });
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { ...supabaseCorsHeaders, 'content-range': '0-0/1' },
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
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: supabaseCorsHeaders });
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: supabaseCorsHeaders,
      body: JSON.stringify([]),
    })
  });

  await page.route('**/rest/v1/wear_logs**', route => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: supabaseCorsHeaders });
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: supabaseCorsHeaders,
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

  const wishlistRequest = page.waitForResponse(response =>
    response.url().includes('/rest/v1/fragrances') && response.ok()
  );
  await page.goto('/you');
  await wishlistRequest;
  await expect(page.getByText('MY WISHLIST')).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('link', { name: /Lattafa Asad/i })).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('link', { name: /Preview an import/i })).toBeVisible();
});
});
