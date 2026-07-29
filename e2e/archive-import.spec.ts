import { expect, test } from '@playwright/test'

const APP_URL = 'http://127.0.0.1:3100'
const PREVIEW_RESPONSE = {
  summary: { total: 2, exact: 1, likely: 0, ambiguous: 1, unmatched: 0 },
  limits: { maxBytes: 100000, maxRows: 75 },
  results: [
    {
      row: {
        sourceRow: 2,
        brand: 'Dior',
        name: 'Sauvage',
        fullName: 'Dior Sauvage',
        source: {
          headers: ['brand', 'name', 'status', 'rating', 'notes'],
          values: ['Dior', 'Sauvage', 'Owned', '4', 'Easy daily wear'],
        },
        status: 'Owned',
        rating: 4,
        notes: 'Easy daily wear',
      },
      outcome: 'exact',
      selectedFragranceId: 'dior-sauvage',
      candidates: [
        {
          id: 'dior-sauvage',
          brand: 'Dior',
          name: 'Sauvage',
          score: 1,
          reason: 'Exact brand and name',
        },
      ],
    },
    {
      row: {
        sourceRow: 3,
        brand: 'Maison Margiela',
        name: 'Jazz Club',
        fullName: 'Maison Margiela Jazz Club',
        source: {
          headers: ['brand', 'name', 'status'],
          values: ['Maison Margiela', 'Jazz Club', 'Wishlist'],
        },
        status: 'Wishlist',
        rating: null,
        notes: '',
      },
      outcome: 'ambiguous',
      selectedFragranceId: null,
      candidates: [
        {
          id: 'jazz-club',
          brand: 'Maison Margiela',
          name: 'Jazz Club',
          score: 0.9,
          reason: 'Similar words',
        },
        {
          id: 'jazz-club-intense',
          brand: 'Maison Margiela',
          name: 'Jazz Club Intense',
          score: 0.78,
          reason: 'Similar words',
        },
      ],
    },
  ],
}

test.describe('Archive Import', () => {
  test('redirects signed-out visitors to login', async ({ page }) => {
    await page.goto('/archive/import')

    await expect(page).toHaveURL(/\/login\?next=(%2Farchive%2Fimport|\/archive\/import)$/)
    await expect(page.getByRole('heading', { name: /Come back to your shelf/i })).toBeVisible()
  })

  test('renders a preview for a signed-in archive import', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'sb-lrkdwobnemczvhpixpky-auth-token',
        value: JSON.stringify(['fake-access-token', 'fake-refresh-token', null, null]),
        url: APP_URL,
      },
      {
        name: 'fake-session',
        value: 'true',
        url: APP_URL,
      },
    ])
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true')
    })
    await page.addInitScript((previewResponse) => {
      const originalFetch = window.fetch.bind(window)

      window.fetch = (input, init) => {
        const url = input instanceof Request ? input.url : input.toString()
        if (url.includes('/api/portability/preview')) {
          return Promise.resolve(new Response(JSON.stringify(previewResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }))
        }

        return originalFetch(input, init)
      }
    }, PREVIEW_RESPONSE)

    await page.goto('/archive/import')
    await expect(page.getByRole('heading', { name: /Bring your history in carefully/i })).toBeVisible()
    const sourceInput = page.getByRole('textbox', { name: /Import source text/i })
    const previewButton = page.getByRole('button', { name: /Preview import/i })

    await expect(sourceInput).toBeEditable()
    await sourceInput.fill('brand,name\nDior,Sauvage')
    await expect(previewButton).toBeEnabled()
    await previewButton.click()

    await expect(page.getByLabel('Import preview summary')).toBeVisible()
    await expect(page.getByLabel('Exact matches')).toContainText('Dior Sauvage')
    await expect(page.getByLabel('Needs review')).toContainText('Maison Margiela Jazz Club')
  })
})
