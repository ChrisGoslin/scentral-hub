import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const routes = process.argv.slice(2)
const targets = routes.length ? routes : ['/study', '/cabinet', '/archive', '/lab', '/ritual', '/welcome', '/read']
const base = process.env.SHOT_BASE || 'http://localhost:3000'
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('.brand-review', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
for (const route of targets) {
  const name = route.replace(/\//g, '_').replace(/^_/, '') || 'root'
  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `.brand-review/${stamp}-${name}.png`, fullPage: false })
  console.log(`${route} -> .brand-review/${stamp}-${name}.png (landed on ${page.url()})`)
}
await browser.close()
