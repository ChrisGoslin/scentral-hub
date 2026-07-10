import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const routes = process.argv.slice(2)
const targets = routes.length ? routes : ['/study', '/cabinet', '/archive', '/lab', '/ritual', '/welcome', '/read']
const base = process.env.SHOT_BASE || 'http://localhost:3000'
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('.brand-review', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const failures = []
for (const route of targets) {
  const name = route.replace(/\//g, '_').replace(/^_/, '') || 'root'
  try {
    const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 30000 })
    if (response && response.status() >= 500) {
      throw new Error(`server responded ${response.status()}`)
    }
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `.brand-review/${stamp}-${name}.png`, fullPage: false })
    console.log(`${route} -> .brand-review/${stamp}-${name}.png (landed on ${page.url()})`)
  } catch (err) {
    failures.push(route)
    console.error(`${route} -> CAPTURE FAILED, no screenshot written: ${err.message}`)
  }
}
await browser.close()
if (failures.length) {
  console.error(`${failures.length}/${targets.length} routes failed: ${failures.join(', ')}`)
  process.exitCode = 1
}
