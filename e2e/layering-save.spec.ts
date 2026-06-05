import { test, expect } from '@playwright/test'

test.describe('Layering Lab save flow (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept /api/formulate and return a canned response
    await page.route('**/api/formulate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          combo_names: ['His Confession', 'Liam Grey'],
          application_steps: ['Spray 2 on chest', 'Spray 1 on wrist'],
          why_it_works: 'Complementary top and base notes',
          predicted_sillage: 'Moderate',
          predicted_hours: 6,
          pro_tip: 'Try alternating order for evening looks',
        }),
      })
    })

    // Intercept save and assert Authorization header exists
    await page.route('**/api/layering/save', async route => {
      const req = route.request()
      const auth = req.headers()['authorization'] || ''
      if (!auth.startsWith('Bearer ')) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Unauthorized' }) })
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, row: { id: 'test-1' } }) })
    })

    // Optionally, set a fake supabase session token in localStorage to simulate signed-in user
    await page.addInitScript(() => {
      try {
        // simple token used by the app for tests — adjust if your supabase client stores elsewhere
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: { access_token: 'fake-test-token' },
          user: { id: 'test-user-id', email: 'test@example.com' }
        }))
      } catch (e) {}
    })
  })

  test('formulate and save combo', async ({ page }) => {
    await page.goto('http://localhost:3000/layering')

    // Wait for collection list and click the first two items
    await page.waitForSelector('button')
    const buttons = await page.$$('button')
    if (buttons.length < 2) {
      test.skip(true, 'Not enough collection items in test environment')
    }
    await buttons[0].click()
    await buttons[1].click()

    // Click Formulate (button text)
    await page.click('text=Formulate')

    // Expect the result modal to appear with combo name
    await expect(page.locator('text=His Confession / Liam Grey')).toBeVisible({ timeout: 3000 })

    // Click Save Combo
    await page.click('text=Save Combo')

    // Expect saved confirmation
    await expect(page.locator('text=Saved — view in Supabase table.')).toBeVisible({ timeout: 3000 })
  })
})
