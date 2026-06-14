import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('redirects new users to onboarding', async ({ page }) => {
    // Start at discover
    await page.goto('/discover');
    // Should be redirected to onboarding because localStorage is empty
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('can complete 3-step onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    // Step 1: Collection size
    await expect(page.locator('h1')).toContainText("What's in your collection right now?");
    await page.getByText('Nothing yet').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2: What matters most
    await expect(page.locator('h1')).toContainText('What do you care about most?');
    await page.getByText('Lasts all day without reapplying').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3: Vibe
    await expect(page.locator('h1')).toContainText('What kind of scents do you reach for?');
    await page.getByText('🔥 Warm & Cosy').click();
    await page.getByRole('button', { name: 'Finish' }).click();

    // Should land on discover and set localStorage
    await expect(page).toHaveURL(/\/discover/);
    
    const onboarded = await page.evaluate(() => localStorage.getItem('scentral_onboarded'));
    const vibe = await page.evaluate(() => localStorage.getItem('scentral_vibe'));
    
    expect(onboarded).toBe('true');
    expect(vibe).toBe('warm');
  });

  test('skip for now works', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByText('Skip for now →').click();
    await expect(page).toHaveURL(/\/discover/);
  });
});
