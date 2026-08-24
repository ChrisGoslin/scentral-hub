import { test, expect } from '@playwright/test';

// Trace post coverage.
//
// Unlike Shelf/Read/Blind-ranking, `app/(main)/traces/page.tsx` is publicly
// readable (no SSR auth redirect — it fetches the feed with a plain
// `fetch(...)`), and `components/traces/TraceComposer.tsx` determines
// signed-in state client-side via the browser Supabase SDK
// (`createClient()` -> `auth.getUser()`) and posts via a plain `fetch('/api/traces', ...)`.
// Both are real browser network calls, so — same pattern as
// e2e/you-tab.spec.ts and e2e/archive-import.spec.ts — this suite can mock
// them with `page.route` and drive the full compose -> submit -> success
// flow without a live Supabase project.
const APP_URL = 'http://127.0.0.1:3100';

test.describe('Trace post', () => {
  test('signed-out visitor sees the sign-in prompt instead of the post button', async ({ page }) => {
    await page.route('**/auth/v1/user**', route =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'not authenticated' }) })
    );

    await page.goto('/traces');
    await expect(page.getByLabel('Trace composer')).toBeVisible({ timeout: 20_000 });
    await page.getByPlaceholder('Write the memory, not the review.').fill('Vetiver held on through the whole meeting.');
    await expect(page.getByText('Sign in to seal this trace.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Leave trace/i })).toHaveCount(0);
  });

  test('signed-in visitor can post a trace and sees it confirmed', async ({ page }) => {
    const supabaseCorsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
    };

    await page.route('**/auth/v1/user**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: supabaseCorsHeaders,
        body: JSON.stringify({ id: 'test-user-id', email: 'test@example.com', user_metadata: {}, app_metadata: {} }),
      })
    );

    let postedBody = '';
    await page.route('**/api/traces', route => {
      if (route.request().method() !== 'POST') return route.continue();
      const payload = route.request().postDataJSON() as { body: string };
      postedBody = payload.body;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          trace: {
            id: 'trace-1',
            user_id: 'test-user-id',
            trace_type: 'moment',
            body: payload.body,
            image_url: null,
            created_at: new Date().toISOString(),
          },
        }),
      });
    });

    await page.context().addCookies([
      {
        name: 'sb-lrkdwobnemczvhpixpky-auth-token',
        value: JSON.stringify(['fake-access-token', 'fake-refresh-token', null, null]),
        url: APP_URL,
      },
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('sb-lrkdwobnemczvhpixpky-auth-token', JSON.stringify({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }));
    });

    await page.goto('/traces');
    const composer = page.getByLabel('Trace composer');
    await expect(composer).toBeVisible({ timeout: 20_000 });

    const textarea = page.getByPlaceholder('Write the memory, not the review.');
    await textarea.fill('Vetiver held on through the whole meeting.');

    const submitButton = page.getByRole('button', { name: /Leave trace/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(page.getByRole('button', { name: 'Trace left' })).toBeVisible({ timeout: 10_000 });
    expect(postedBody).toBe('Vetiver held on through the whole meeting.');
    // The composer clears its own body on success.
    await expect(textarea).toHaveValue('');
  });

  test('rejects an empty trace before hitting the network', async ({ page }) => {
    await page.route('**/auth/v1/user**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-user-id', email: 'test@example.com', user_metadata: {}, app_metadata: {} }),
      })
    );
    await page.context().addCookies([
      { name: 'sb-lrkdwobnemczvhpixpky-auth-token', value: JSON.stringify(['fake-access-token', 'fake-refresh-token', null, null]), url: APP_URL },
    ]);

    await page.goto('/traces');
    await expect(page.getByLabel('Trace composer')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: /Leave trace/i })).toBeDisabled();
  });
});
