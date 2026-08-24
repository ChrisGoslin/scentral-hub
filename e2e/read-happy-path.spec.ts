import { test, expect } from '@playwright/test';

// Read happy path coverage.
//
// `app/read/page.tsx` is a server component that redirects signed-out
// visitors straight to `/login?next=/read` before `ReadClient` ever mounts
// (`if (!user) redirect(...)`, no E2E_AUTH_BYPASS hook — same constraint
// documented in e2e/shelf-capacity-eligibility.spec.ts). A fake auth cookie
// is not a valid Supabase JWT, so the signed-out redirect is the one
// deterministic behavior this suite can exercise for /read without a live
// account; the full feeling-chip -> Haiku identity reveal ritual
// (app/read/ReadClient.tsx: prefetch -> breath -> hold -> reveal phases,
// READ_RITUAL_TIMING) needs a real session to reach.
test.describe('Read happy path', () => {
  test('signed-out visitor is redirected to login before the ritual starts', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
    await page.goto('/read');

    await expect(page).toHaveURL(/\/login\?next=(%2Fread|\/read)$/);
  });

  test('API rejects generating a reading without a session', async ({ request }) => {
    const res = await request.post('/api/read/generate', {
      data: { feelings: ['warm_skin'], ownedFamilies: [], signals: [] },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  // NOT RUNNABLE in this environment without a live Supabase session:
  // - Choosing feeling-chips on /welcome (or wherever nota_entry_signals is
  //   seeded, see ReadClient.tsx's getFallbackSignals) and landing on /read
  //   as a signed-in user progresses prefetch -> breath -> hold -> reveal
  //   and renders the identity dossier (noseprintName, descriptor, 3
  //   behavioral signals, 3 starter matches, stretch note) with reaction
  //   buttons ("That feels like me" / "Close" / "Not quite") that save a
  //   noseprints row and route to /noseprint.
  // Needs a seeded authenticated fixture or E2E_AUTH_BYPASS extended to
  // app/read/page.tsx — flagging for follow-up.
});
