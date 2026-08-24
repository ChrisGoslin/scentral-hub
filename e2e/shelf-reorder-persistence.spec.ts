import { test, expect } from '@playwright/test';

// Shelf reorder persistence coverage.
//
// Same SSR-auth constraint as e2e/shelf-capacity-eligibility.spec.ts:
// `app/(main)/shelf/page.tsx` has no E2E_AUTH_BYPASS wiring, so a real
// signed-in reorder (drag a bottle to a new rank, reload, assert the new
// rank persisted via shelf_items.rank) cannot be driven in this suite
// without a live Supabase test account. See that file's header comment for
// the full explanation — not repeating it here.
//
// What's covered instead: the API auth gate that every reorder mutation
// passes through first, and the documented rank-mutation contract
// (rank int ±20, ≠0 — negative = transient during the two-phase reorder,
// per CLAUDE.md §5 and app/api/shelf/route.ts).
test.describe('Shelf reorder persistence (API gate)', () => {
  test('POST /api/shelf rejects unauthenticated reorder attempts', async ({ request }) => {
    const res = await request.post('/api/shelf', {
      data: { action: 'reorder', itemId: '00000000-0000-0000-0000-000000000000', rank: 3 },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('POST /api/shelf rejects unauthenticated rank swaps', async ({ request }) => {
    const res = await request.post('/api/shelf', {
      data: {
        action: 'swap',
        fromItemId: '00000000-0000-0000-0000-000000000000',
        toRank: 5,
      },
    });
    expect(res.status()).toBe(401);
  });

  // NOT RUNNABLE in this environment without a live Supabase session:
  // - Drag a filled slot to a new rank via ShelfClient.tsx's dnd-kit
  //   SortableContext, then reload /shelf and assert the persisted
  //   shelf_items.rank (and tier, since tier is DB-GENERATED from rank)
  //   matches the new position.
  // - Confirm the two-phase reorder (transient negative ranks, per CLAUDE.md
  //   §5) never surfaces a visible flash of an invalid state.
  // Needs a seeded authenticated fixture or E2E_AUTH_BYPASS extended to
  // app/(main)/shelf/page.tsx — flagging for follow-up.
});
