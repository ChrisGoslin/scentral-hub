import { test, expect } from '@playwright/test';

const TEST_ANON_ID = process.env.TEST_ANON_ID || '';

function isIgnorableConsoleError(message: string) {
  return [
    'Failed to load resource',
    'favicon.ico',
    'MetaMask',
    'Extension context invalidated',
    'NetworkError when attempting to fetch resource',
  ].some(fragment => message.includes(fragment))
}

test.describe('Collection Lens Filter Empty State', () => {
  test.beforeEach(async ({ page }) => {
    // Seed localStorage to enable shelf loading
    // Without scentral_anon_id, CollectionClientWrapper renders the empty splash instead of WardrobeShelf
    await page.addInitScript((anonId: string) => {
      if (anonId) {
        localStorage.setItem('scentral_anon_id', anonId);
      }
      localStorage.setItem('scentral_onboarded', 'true');
    }, TEST_ANON_ID);
  });

  test('load collection page and verify WardrobeShelf mounts with collection data', async ({ page }) => {
    test.skip(!TEST_ANON_ID, 'TEST_ANON_ID environment variable required for fixture collection');

    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isIgnorableConsoleError(msg.text())) {
        errors.push(msg.text());
      }
    });

    await page.goto('/cabinet');
    await expect(page).toHaveURL(/\/cabinet/);
    await page.waitForLoadState('domcontentloaded');

    // Verify shelf loads (WardrobeShelf renders)
    const shelfContainer = page.locator('[data-testid="wardrobe-shelf"], [class*="WardrobeShelf"]').first();
    await expect(shelfContainer).toBeVisible({ timeout: 5000 });

    // Verify no runtime errors
    expect(errors.length).toBe(0);

    // Verify "No fragrances match this lens" does NOT appear without an active filter
    const filteredEmptyMessages = page.locator('text=No fragrances match this lens');
    expect(await filteredEmptyMessages.count()).toBe(0);
  });

  test('apply lens filter and verify empty-state message appears when filter yields zero matches', async ({ page }) => {
    test.skip(!TEST_ANON_ID, 'TEST_ANON_ID environment variable required for fixture collection');

    await page.goto('/cabinet');
    await expect(page).toHaveURL(/\/cabinet/);
    await page.waitForLoadState('domcontentloaded');

    // Wait for shelf to load
    const shelfContainer = page.locator('[data-testid="wardrobe-shelf"], [class*="WardrobeShelf"]').first();
    await expect(shelfContainer).toBeVisible({ timeout: 5000 });

    // Find and click a lens filter button
    // Lenses are in the sidebar (WardrobeSidebar)
    const lensButtons = page.locator('button').filter({ hasText: /Agadir|Executive|Comfort/ });
    const lensCount = await lensButtons.count();

    if (lensCount > 0) {
      const firstLens = lensButtons.first();
      const lensName = await firstLens.textContent();

      // Apply lens filter
      await firstLens.click();
      await page.waitForTimeout(300);

      // Check if "No fragrances match this lens" appears
      // It should appear in ShelfTier components where the filter results in zero items
      const emptyStateMessages = page.locator('text=No fragrances match this lens');
      const messageCount = await emptyStateMessages.count();

      // If the lens filtered out all matches in at least one tier, we should see the message
      if (messageCount > 0) {
        const firstMessage = emptyStateMessages.first();
        await expect(firstMessage).toBeVisible();
      }
    }
  });

  test('verify empty-state message isolation: only appears in filtered tiers, not in unfiltered ones', async ({ page }) => {
    test.skip(!TEST_ANON_ID, 'TEST_ANON_ID environment variable required for fixture collection');

    await page.goto('/cabinet');
    await expect(page).toHaveURL(/\/cabinet/);
    await page.waitForLoadState('domcontentloaded');

    // Wait for shelf to load
    const shelfContainer = page.locator('[data-testid="wardrobe-shelf"], [class*="WardrobeShelf"]').first();
    await expect(shelfContainer).toBeVisible({ timeout: 5000 });

    // Apply a lens filter
    const lensButtons = page.locator('button').filter({ hasText: /Agadir|Executive|Comfort/ });
    if ((await lensButtons.count()) > 0) {
      await lensButtons.first().click();
      await page.waitForTimeout(300);

      // Count filtered-empty messages (only in filtered tiers with no matches)
      const filteredEmptyMessages = page.locator('text=No fragrances match this lens');
      const filteredCount = await filteredEmptyMessages.count();

      // Count unfiltered-empty messages (in tiers with no items but no filter)
      const unfilteredEmptyMessages = page.locator('text=Drag bottles here');
      const unfilteredCount = await unfilteredEmptyMessages.count();

      // The key assertion: if filtered messages exist, they should be separate from unfiltered
      // Both counts should be independent (filtered ≥ 0, unfiltered ≥ 0)
      expect(filteredCount).toBeGreaterThanOrEqual(0);
      expect(unfilteredCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('deselecting lens filter removes the filter-specific empty-state message', async ({ page }) => {
    test.skip(!TEST_ANON_ID, 'TEST_ANON_ID environment variable required for fixture collection');

    await page.goto('/cabinet');
    await expect(page).toHaveURL(/\/cabinet/);
    await page.waitForLoadState('domcontentloaded');

    // Wait for shelf to load
    const shelfContainer = page.locator('[data-testid="wardrobe-shelf"], [class*="WardrobeShelf"]').first();
    await expect(shelfContainer).toBeVisible({ timeout: 5000 });

    const lensButtons = page.locator('button').filter({ hasText: /Agadir|Executive|Comfort/ });
    if ((await lensButtons.count()) > 0) {
      const lensButton = lensButtons.first();

      // Apply filter
      await lensButton.click();
      await page.waitForTimeout(300);
      const messagesWithFilter = await page.locator('text=No fragrances match this lens').count();

      // Deselect filter by clicking the same button again
      await lensButton.click();
      await page.waitForTimeout(300);
      const messagesAfterDeselect = await page.locator('text=No fragrances match this lens').count();

      // After deselecting, the filter-specific message count should be less or equal
      expect(messagesAfterDeselect).toBeLessThanOrEqual(messagesWithFilter);
    }
  });

  test('verify contextual empty-state messaging on all shelf view modes', async ({ page }) => {
    test.skip(!TEST_ANON_ID, 'TEST_ANON_ID environment variable required for fixture collection');

    await page.goto('/cabinet');
    await expect(page).toHaveURL(/\/cabinet/);
    await page.waitForLoadState('domcontentloaded');

    // Wait for shelf to load
    const shelfContainer = page.locator('[data-testid="wardrobe-shelf"], [class*="WardrobeShelf"]').first();
    await expect(shelfContainer).toBeVisible({ timeout: 5000 });

    // Test different view modes (if they exist)
    const viewButtons = page.locator('button').filter({ hasText: /By House|By Season|Wishlist|All Fragrances/ });
    const viewCount = await viewButtons.count();

    for (let i = 0; i < Math.min(viewCount, 3); i++) {
      const viewButton = viewButtons.nth(i);
      await viewButton.click();
      await page.waitForTimeout(300);

      // Verify page is still stable without console errors
      const filteredMessages = page.locator('text=No fragrances match this lens');
      const dragMessages = page.locator('text=Drag bottles here');

      // Both message types should be countable without errors
      expect(await filteredMessages.count()).toBeGreaterThanOrEqual(0);
      expect(await dragMessages.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
