import { test, expect } from '@playwright/test'

test.describe('SEO Titles', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true')
    })
  })

  test('shelf and traces have page-specific titles', async ({ page }) => {
    await page.goto('/shelf')
    await expect(page).toHaveTitle(/My Shelf \| nota\./)

    await page.goto('/traces')
    await expect(page).toHaveTitle(/Traces \| nota\./)
  })
})
