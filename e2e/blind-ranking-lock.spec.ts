import { test, expect } from '@playwright/test';

// Blind ranking lock coverage.
//
// `app/(main)/shelf/blind/page.tsx` computes `isSignedIn` server-side via a
// real `auth.getUser()` call (no E2E_AUTH_BYPASS hook, same constraint as
// e2e/shelf-capacity-eligibility.spec.ts) and passes it into
// `BlindRankingClient`. A fake auth cookie does not pass Supabase's session
// check, so this suite can genuinely reach and assert the signed-out gate
// (real, deterministic behavior) but not the authenticated ranking flow
// itself (placing all 10, the "once placed, it's locked — no undo" rule,
// and the reveal step) without a live Supabase test account.
test.describe('Blind ranking lock', () => {
  test('signed-out visitor sees the sign-in gate, not the ranking UI', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
    await page.goto('/shelf/blind');

    await expect(page.getByText('Blind ranking needs you signed in.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('API rejects placing a rank without a session', async ({ request }) => {
    const res = await request.post('/api/blind-ranking/place', {
      data: { sessionId: '00000000-0000-0000-0000-000000000000', fragranceId: '00000000-0000-0000-0000-000000000001', placedRank: 1 },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('API rejects starting a session without a session', async ({ request }) => {
    const res = await request.post('/api/blind-ranking/session');
    expect(res.status()).toBe(401);
  });

  test('API rejects revealing results without a session', async ({ request }) => {
    const res = await request.post('/api/blind-ranking/reveal', {
      data: { sessionId: '00000000-0000-0000-0000-000000000000' },
    });
    expect(res.status()).toBe(401);
  });

  // NOT RUNNABLE in this environment without a live Supabase session:
  // - Place a fragrance into a rank slot and assert it becomes visually
  //   locked (BlindRankingClient.tsx: "Tap a rank to place it. Once placed,
  //   it's locked.") and cannot be re-picked or undone.
  // - Placing all 10 unlocks the reveal step
  //   (POST /api/blind-ranking/reveal) and the revealed brand/name copy
  //   renders exactly once per session.
  // Needs a seeded authenticated fixture or E2E_AUTH_BYPASS extended to
  // app/(main)/shelf/blind/page.tsx — flagging for follow-up.
});
