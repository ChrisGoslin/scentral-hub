#!/usr/bin/env node
/**
 * smoke-test.mjs
 * Hits key routes on the live Vercel deployment and reports pass/fail.
 *
 * Usage:
 *   node scripts/smoke-test.mjs
 *   BASE_URL=https://your-preview.vercel.app node scripts/smoke-test.mjs
 */

const BASE_URL = process.env.BASE_URL || 'https://scentral-hub.vercel.app'

const ROUTES = [
  // [path, expected status, description]
  ['/',                200, 'Landing page'],
  ['/discover',        200, 'Discover page'],
  ['/collection',      200, 'My Bottles page'],
  ['/layering',        200, 'Layering page'],
  ['/you',             200, 'You tab'],
  ['/onboarding',      200, 'Onboarding flow'],
  ['/spritz',          200, 'Spritz Schedule page'],
  ['/privacy',         200, 'Privacy Policy page'],
  ['/terms',           200, 'Terms of Service page'],
  ['/api/fragrances?q=lattafa', 200, 'Search API'],
  ['/api/search?q=rose', 200, 'Smells Like Search API'],
  ['/api/waitlist',    405, 'Waitlist API (GET should 405)'],
  ['/api/wear',        405, 'Wear API (GET should 405)'],
]

const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'
const DIM  = '\x1b[2m'
const RST  = '\x1b[0m'

async function run() {
  console.log(`\n${DIM}Smoke testing ${BASE_URL}${RST}\n`)

  let passed = 0
  let failed = 0
  const failures = []

  for (const [path, expectedStatus, label] of ROUTES) {
    const url = `${BASE_URL}${path}`
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'scentral-smoke-test/1.0' },
        signal: AbortSignal.timeout(10_000),
      })

      const ok = res.status === expectedStatus
      if (ok) {
        passed++
        console.log(`  ${PASS} ${label} ${DIM}(${res.status})${RST}`)
      } else {
        failed++
        const msg = `Expected ${expectedStatus}, got ${res.status}`
        failures.push({ label, url, msg })
        console.log(`  ${FAIL} ${label} ${DIM}— ${msg}${RST}`)
      }
    } catch (err) {
      failed++
      const msg = err.message
      failures.push({ label, url, msg })
      console.log(`  ${FAIL} ${label} ${DIM}— ${msg}${RST}`)
    }
  }

  console.log(`\n  ${passed} passed · ${failed} failed\n`)

  if (failures.length > 0) {
    console.log('Failures:')
    for (const { label, url, msg } of failures) {
      console.log(`  • ${label}\n    ${DIM}${url}${RST}\n    ${msg}`)
    }
    console.log()
    process.exit(1)
  }
}

run()
