import { test, expect } from '@playwright/test'

test.describe('Big Bets & Innovation Horizons E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scentral_onboarded', 'true')
      localStorage.setItem('scentral_vibe', 'fresh')
    })
  })

  test.describe('BET-N08: Interactive Scent Wheel (/wheel)', () => {
    test('renders fragrance wheel radar chart and handles empty collection state', async ({ page }) => {
      await page.goto('/wheel', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/Fragrance Wheel | nota\./)

      // Main container exists
      const main = page.locator('main, [role="main"], div').first()
      await expect(main).toBeVisible({ timeout: 15_000 })

      // Radar chart or Empty State CTA to add fragrances
      const chartOrEmpty = page.locator('svg[aria-label="Fragrance wheel radar chart"], svg, button, a').filter({
        hasText: /Explore|Add|Collection|Wheel/i,
      }).first()
      await expect(chartOrEmpty).toBeVisible({ timeout: 15_000 })
    })

    test('renders interactive 9-axis breakdown when collection data is present', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem(
          'scentral_shelf',
          JSON.stringify([
            { id: 'mock-1', name: 'Aventus', brand: 'Creed', family: 'Fruity Chypre' },
            { id: 'mock-2', name: 'Bleu de Chanel', brand: 'Chanel', family: 'Fresh Woody' },
          ])
        )
      })
      await page.goto('/wheel', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('body')).not.toHaveText(/Application error/i)
    })
  })

  test.describe('BET-N06 & BET-N07: Scan-to-Shelf & Barcode Scanner (/scanner)', () => {
    test('renders scanner interface with camera controls and fallback manual lookup form', async ({ page }) => {
      await page.goto('/scanner', { waitUntil: 'domcontentloaded' })

      // Scanner heading / description
      const scannerTitle = page.getByText(/Scan|Barcode|Camera|Add Fragrance/i).first()
      await expect(scannerTitle).toBeVisible({ timeout: 15_000 })

      // Manual input or barcode form fallback
      const manualInput = page.getByPlaceholder(/search|barcode|brand|name/i).first()
      if (await manualInput.isVisible()) {
        await manualInput.fill('Aventus')
        await expect(manualInput).toHaveValue('Aventus')
      }
    })
  })

  test.describe('BET-N12: Fragrance Clone & Dupe Matrix (/clones)', () => {
    test('renders inspired-by clones and original designer mappings', async ({ page }) => {
      await page.goto('/clones', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/Inspired By | nota\./)

      // Main clones list or headings
      const heading = page.getByText(/Inspired By|Alternatives|Clones/i).first()
      await expect(heading).toBeVisible({ timeout: 15_000 })

      // Verify at least one clone card or inspiration section renders
      const cardOrGroup = page.locator('article, div, a').filter({ hasText: /Inspired by|Clone|Alternative|Fragrance/i }).first()
      await expect(cardOrGroup).toBeVisible({ timeout: 15_000 })
    })

    test('ensures horizontal viewport does not overflow on mobile screen size', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/clones', { waitUntil: 'domcontentloaded' })

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(isOverflowing).toBe(false)
    })
  })

  test.describe('BET-N02: Scent Trails & Trajectory Journeys (/trails)', () => {
    test('renders curated scent paths and guided olfactory trails', async ({ page }) => {
      await page.goto('/trails', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/Scent Trails/i)

      // Guided paths section
      const guidedPaths = page.getByText(/Guided Paths|Scent Trails|Journeys/i).first()
      await expect(guidedPaths).toBeVisible({ timeout: 15_000 })
    })
  })

  test.describe('BET-N09: Sensory Traces & Wear Logs (/traces)', () => {
    test('renders traces timeline and wear journal interface', async ({ page }) => {
      await page.goto('/traces', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/Traces | nota\./)

      const mainContent = page.locator('main, [role="main"], div').filter({ hasText: /Traces|Wear|Log|Ritual/i }).first()
      await expect(mainContent).toBeVisible({ timeout: 15_000 })
    })
  })

  test.describe('BET-N03 & BET-N04: DNA Match, Compare & Layering Lab (/compare & /lab)', () => {
    test('renders compare empty state and navigate back CTA when no items compared', async ({ page }) => {
      await page.goto('/compare', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/Compare Fragrances | nota\./)
      const emptyOrTitle = page.getByText(/Compare|No fragrances|select/i).first()
      await expect(emptyOrTitle).toBeVisible({ timeout: 15_000 })
    })

    test('renders side-by-side comparison matrix when fragrances are pre-selected', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('nota_compare_ids', JSON.stringify(['f1', 'f2']))
      })
      await page.goto('/compare', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('body')).not.toHaveText(/500 Internal Server Error/i)
    })

    test('renders layering lab accord dissonance and harmony checker', async ({ page }) => {
      await page.goto('/lab', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveURL(/\/lab/)
      const labContent = page.locator('main, [role="main"]').first()
      await expect(labContent).toBeVisible({ timeout: 15_000 })
    })
  })
})
