import { test, expect } from '@playwright/test';

test.describe('Collection (My Bottles)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('scentral_onboarded', 'true');
    });
  });

  test('shows empty state when no bottles owned', async ({ page }) => {
    // Assuming a fresh session has 0 bottles (since we aren't signed in)
    await page.goto('/collection');
    // Align with the headline in CollectionClient.tsx
    await expect(page.getByText('Your collection starts here.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Explore 280+ Scents' })).toBeVisible();
  });

  test('can open add bottle sheet', async ({ page }) => {
    await page.goto('/collection');
    // Use exact match for the + button to avoid matching '280+ Scents'
    await page.getByRole('button', { name: '+', exact: true }).click();
    
    await expect(page.getByText('Add a bottle', { exact: true })).toBeVisible();
    const searchInput = page.getByPlaceholder('Search by name or brand...');
    await searchInput.fill('Lattafa');
    
    // Wait for results to appear in the scrollable list
    await expect(page.locator('button').filter({ hasText: 'Lattafa' }).first()).toBeVisible({ timeout: 15000 });
  });
});
