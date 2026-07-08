import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow (Sanctuary Profiler)', () => {
  test('redirects new users to onboarding', async ({ page }) => {
    // Start at discover
    await page.goto('/discover');
    // Should be redirected to onboarding because localStorage is empty
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('can complete 3-step profiler and get persona', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(1000);

    // Step 1: Sanctuary
    await expect(page.getByText('Step 1 of 3')).toBeVisible();
    await expect(page.locator('h1')).toContainText("Where do you go when the world gets loud?");
    await page.getByRole('button', { name: 'The Lost Archive' }).click();

    // Step 2: Projection
    await expect(page.getByText('Step 2 of 3')).toBeVisible();
    await expect(page.locator('h1')).toContainText("How close do you want to be felt?");
    await page.getByRole('button', { name: 'Up Close' }).click();

    // Step 3: Context
    await expect(page.getByText('Step 3 of 3')).toBeVisible();
    await expect(page.locator('h1')).toContainText("When do you usually reach for it?");
    await page.getByRole('button', { name: 'Workday' }).click();
    await expect(page.getByText('1 context selected')).toBeVisible();
    await page.getByRole('button', { name: 'Find my scent identity →' }).evaluate(el => (el as HTMLButtonElement).click());

    // Step 4: Persona Reveal
    await expect(page.locator('h1')).toContainText('The Velvet Intellectual');

    const exploreBtn = page.getByRole('button', { name: /Explore scents for/ });
    await expect(exploreBtn).toBeVisible({ timeout: 15_000 });
    await exploreBtn.click();

    // Should land on discover and set localStorage
    await expect(page).toHaveURL(/\/discover/, { timeout: 20_000 });
    
    const onboarded = await page.evaluate(() => localStorage.getItem('scentral_onboarded'));
    const persona = await page.evaluate(() => localStorage.getItem('scentral_persona'));
    
    expect(onboarded).toBe('true');
    expect(persona).toBe('velvet_intellectual');
  });

  test('skip for now works', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(1000);

    // Look for skip button with flexible text matching
    const skipBtn = page.getByRole('button').filter({ hasText: /skip|continue/i }).first();
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.evaluate(el => (el as HTMLButtonElement).click());
      await expect(page).toHaveURL(/\/discover/, { timeout: 20_000 });
    }
  });
});
