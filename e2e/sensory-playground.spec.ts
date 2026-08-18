import { test, expect } from '@playwright/test'

test.describe('Sensory Playground (Feature 113 & Toggles)', () => {
  test('Renders playground and toggles AMOLED, Quiet, and Thermal modes', async ({ page }) => {
    await page.goto('/labs/sensory')

    // 1. Check baseline rendering
    await expect(page.locator('h1')).toContainText('Sensory Playground')
    
    // 2. Test Quiet Mode Toggle
    const quietBtn = page.getByRole('button', { name: /Quiet Mode/i })
    await quietBtn.click()
    // Button should become active (background white)
    await expect(quietBtn).toHaveCSS('background-color', 'rgb(255, 255, 255)')

    // 3. Test AMOLED Toggle
    const amoledBtn = page.getByRole('button', { name: /AMOLED Black/i })
    await amoledBtn.click()
    // The main container should shift to black
    const container = page.locator('div.min-h-screen')
    await expect(container).toHaveCSS('background-color', 'rgb(0, 0, 0)')

    // 4. Test Thermal UI Toggle
    const thermalBtn = page.getByRole('button', { name: /Thermal UI/i })
    await thermalBtn.click()
    // The inner container should get the thermal filter (hue-rotate)
    const contentDiv = page.locator('.max-w-md.text-center.z-10')
    await expect(contentDiv).toHaveCSS('filter', 'hue-rotate(90deg) saturate(2)')
  })

  test('Simulates DeviceMotion to trigger Shake-to-Rattle', async ({ page, browserName }) => {
    // WebKit test runner lacks native mock support for DeviceMotionEvent in this environment
    test.skip(browserName === 'webkit', 'WebKit DeviceMotion mock unsupported in test env')

    await page.goto('/labs/sensory')

    // Dispatch a mock devicemotion event to simulate a hard shake (threshold > 15)
    await page.evaluate(() => {
      // Create and dispatch event
      const event = new Event('devicemotion') as any
      event.accelerationIncludingGravity = { x: 25, y: 0, z: 0 }
      window.dispatchEvent(event)
    })

    // The shake count should appear
    await expect(page.getByText('Glass Rattled: 1 times')).toBeVisible()
    
    // Shake it again
    await page.evaluate(() => {
      const event = new Event('devicemotion') as any
      event.accelerationIncludingGravity = { x: -25, y: 0, z: 0 } // delta is 50 > 15
      window.dispatchEvent(event)
    })

    await expect(page.getByText('Glass Rattled: 2 times')).toBeVisible()
  })

  test('Simulates Spray and Fingerprint Smudge (Feature 117 & 119)', async ({ page }) => {
    await page.goto('/labs/sensory')

    // Find the bottle
    const bottleContainer = page.locator('div[style*="160px"]')

    // Click the bottle to spray and leave a smudge (force true to bypass cookie banners)
    await bottleContainer.click({ force: true })

    // A smudge div should be rendered inside the bottle
    await expect(bottleContainer.locator('div[style*="radial-gradient"]')).toHaveCount(1)

    // Click again, should have 2 smudges
    await bottleContainer.click({ force: true })
    await expect(bottleContainer.locator('div[style*="radial-gradient"]')).toHaveCount(2)
    
    // Hit Refill (Wipe Glass) to clear smudges
    await page.getByRole('button', { name: /Refill \(Wipe Glass\)/i }).click({ force: true })
    await expect(bottleContainer.locator('div[style*="radial-gradient"]')).toHaveCount(0)
  })
})
