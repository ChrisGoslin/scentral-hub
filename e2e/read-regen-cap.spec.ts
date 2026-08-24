import { test, expect } from '@playwright/test';

// Read regen cap coverage.
//
// Checked `app/api/read/generate/route.ts` directly before writing this spec
// (per the task brief — another track may have touched this route): the cap
// is a server-side rate limit of **1 Read generation per user per rolling
// hour**, enforced by counting `interactions` rows with
// `event_type = 'read_generated'` in the last 60 minutes:
//
//   if ((recentReads ?? 0) >= 1) return 429 { error: 'Rate limited. Try again later.' }
//
// This runs *after* the `auth.getUser()` check, so a second POST from the
// same unauthenticated caller still short-circuits at 401, not 429 — the
// 429 path is only reachable with a real signed-in user who already has a
// `read_generated` interaction row within the last hour, which needs a live
// Supabase session (no E2E_AUTH_BYPASS hook on this route or on
// app/read/page.tsx — see e2e/read-happy-path.spec.ts for the same
// constraint). What's verifiable here without one: the auth gate that comes
// before the rate-limit check, and a documented, code-cited assertion of
// what the cap actually is so a future session doesn't have to re-derive it.
test.describe('Read regen cap', () => {
  test('unauthenticated request is rejected before the rate-limit check runs', async ({ request }) => {
    const res = await request.post('/api/read/generate', {
      data: { feelings: ['warm_skin'], ownedFamilies: [], signals: [] },
    });
    // Confirms the 401 auth gate short-circuits ahead of the 429 rate-limit
    // check for an anonymous caller — i.e. hammering this route unauthenticated
    // cannot be used to probe or exhaust the per-user regen cap.
    expect(res.status()).toBe(401);
  });

  // NOT RUNNABLE in this environment without a live Supabase session:
  // - Sign in, POST /api/read/generate once (200, writes an `interactions`
  //   row with event_type='read_generated'), POST again within the same
  //   hour and assert 429 with body.error === 'Rate limited. Try again
  //   later.'.
  // - Assert ReadClient.tsx surfaces that message as `error` state (the
  //   "The room did not settle cleanly." screen) rather than getting stuck
  //   on the prefetch/breath phase.
  // Needs a seeded authenticated fixture (and control over the
  // `interactions` table state) or E2E_AUTH_BYPASS extended to this route —
  // flagging for follow-up.
});
