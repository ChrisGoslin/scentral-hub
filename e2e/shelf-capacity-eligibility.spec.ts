import { test, expect } from '@playwright/test';

// Shelf capacity/eligibility coverage.
//
// `app/(main)/shelf/page.tsx` is a server component that reads the Supabase
// session from real cookies (`cookies()` + `createClient()` + `auth.getUser()`)
// and has no E2E_AUTH_BYPASS hook (unlike `app/(main)/archive` and
// `app/(main)/you`, which route through `getArchiveSession()` — see
// `app/(main)/archive/archive-session.ts`). A fake `sb-*-auth-token` cookie is
// not a valid JWT, so Supabase's server-side session check rejects it and the
// page renders its signed-out empty state — it cannot be used to reach the
// authenticated Shelf UI (20-slot grid, tier sections, eligibility-gated
// search sheet) in this suite today.
//
// Until that bypass is wired for /shelf (or a seeded live Supabase test user
// is available in CI), the two layers below are what this suite can actually
// exercise without a live account:
//   1. The signed-out Shelf UI (kept in e2e/shelf.spec.ts — not duplicated here).
//   2. The API's auth gate, which is the first eligibility-relevant check any
//      shelf mutation goes through — SHELF_SIZE (20) and the
//      shelf_eligibility_required rejection (`ShelfClient.tsx`'s
//      `canMarkTested` handling) live behind this same `auth.getUser()` guard
//      in `app/api/shelf/route.ts`.
test.describe('Shelf capacity & eligibility (API gate)', () => {
  test('GET /api/shelf rejects unauthenticated requests', async ({ request }) => {
    const res = await request.get('/api/shelf');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('POST /api/shelf rejects unauthenticated add/reorder attempts', async ({ request }) => {
    const res = await request.post('/api/shelf', {
      data: { action: 'add', fragranceId: '00000000-0000-0000-0000-000000000000', rank: 1 },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  // NOT RUNNABLE in this environment without a live Supabase session:
  // - Adding a 21st fragrance to a full shelf is rejected (SHELF_SIZE=20,
  //   app/(main)/shelf/page.tsx:15 and app/api/shelf/route.ts:13).
  // - Adding a fragrance whose collections.status is neither owned/tested/
  //   past_purchase is rejected with `code: 'shelf_eligibility_required'`
  //   and the client offers `canMarkTested` (ShelfClient.tsx ~line 651).
  // These need either a seeded authenticated fixture or the E2E_AUTH_BYPASS
  // pattern extended to app/(main)/shelf/page.tsx — flagging for a follow-up
  // rather than guessing at unverifiable behavior.
});
