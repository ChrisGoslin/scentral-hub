import { test, expect } from '@playwright/test';

// Rewritten 2026-08-19: the previous version of this file tested
// components/landing/HeroSection.tsx (video hero, slow-connection poster
// fallback, personalization badge, pause/play button). That component was
// removed from app/page.tsx by commit 5125fe3 ("Master UX/UI Rebuild —
// Scenthesia") on 2026-08-18 and replaced with a static parallax hero
// (app/page.tsx) that has none of those states. The old file kept "passing"
// its own assertions right up until it started failing 100% of the time —
// no one ran the full suite between the rebuild landing and this rewrite,
// so the break went undetected for ~2 weeks. See docs/lessons.md for the
// remedy (scheduled full e2e run, not just pre-push chromium-only checks).

test.describe('Landing Hero (Scenthesia rebuild)', () => {
  test('hero renders title, kicker, and subtitle immediately', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('The Living Atelier')).toBeVisible();
    await expect(page.locator('h1')).toContainText('nota');
    await expect(page.getByText('Your scent identity, written in motion.')).toBeVisible();
  });

  test('hero title is immediately paintable (LCP-relevant opacity)', async ({ page }) => {
    await page.goto('/');

    const heroContent = page.locator('h1').locator('..');
    const opacity = await heroContent.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThan(0);
  });

  test('manifesto section renders below the hero', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('The system notices before it asks.')).toBeVisible();
  });

  test('entry section CTAs link to the correct destinations', async ({ page }) => {
    await page.goto('/');

    const shelfLink = page.getByRole('link', { name: 'Enter Master Shelf' });
    await expect(shelfLink).toBeVisible();
    await expect(shelfLink).toHaveAttribute('href', '/shelf');

    const labsLink = page.getByRole('link', { name: 'Experience nota.Labs' });
    await expect(labsLink).toBeVisible();
    await expect(labsLink).toHaveAttribute('href', '/labs');
  });

  test('landing page loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
});
