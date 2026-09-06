import { test, expect } from '@playwright/test'

test.describe('Landmark structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true')
    })
  })

  test('exactly one <main> landmark on a (main) route-group page', async ({ page }) => {
    await page.goto('/shelf')
    await expect(page.locator('main')).toHaveCount(1)
  })

  test('exactly one <main> landmark on a route outside the (main) group', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('main')).toHaveCount(1)
  })
})
