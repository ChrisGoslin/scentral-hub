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
  ['/intelligence',    200, 'Deep Dive (beta-open Pro route)'],
  ['/dna-match',       200, 'Compare Scents (beta-open Pro route)'],
  ['/api/fragrances?q=lattafa', 200, 'Search API'],
  ['/api/search?q=rose', 200, 'Smells Like Search API'],
  ['/api/waitlist',    405, 'Waitlist API (GET should 405)'],
  ['/api/wear',        405, 'Wear API (GET should 405)'],
]

const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'
const DIM  = '\x1b[2m'
const RST  = '\x1b[0m'

async function testFragranceById(fragranceId) {
  const url = `${BASE_URL}/api/fragrances?id=${encodeURIComponent(fragranceId)}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'scentral-smoke-test/1.0' },
      signal: AbortSignal.timeout(10_000),
    })

    if (res.status !== 200) {
      throw new Error(`Expected 200, got ${res.status}`)
    }

    const data = await res.json()
    const fragrances = data.similar_fragrances || []

    if (!fragrances.length) {
      throw new Error('No fragrances returned for ID lookup')
    }

    if (fragrances.length > 1) {
      throw new Error(`Expected 1 fragrance, got ${fragrances.length}`)
    }

    if (fragrances[0].id !== fragranceId) {
      throw new Error(`Expected fragrance ID ${fragranceId}, got ${fragrances[0].id}`)
    }

    return { ok: true, msg: null }
  } catch (err) {
    return { ok: false, msg: err.message }
  }
}

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

  // Test ?id= param by first fetching a search result, then looking up that ID
  try {
    const searchUrl = `${BASE_URL}/api/fragrances?q=rose`
    const searchRes = await fetch(searchUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'scentral-smoke-test/1.0' },
      signal: AbortSignal.timeout(10_000),
    })

    if (searchRes.ok) {
      const searchData = await searchRes.json()
      const fragrances = searchData.similar_fragrances || []
      if (fragrances.length > 0) {
        const testId = fragrances[0].id
        const idTestResult = await testFragranceById(testId)
        if (idTestResult.ok) {
          passed++
          console.log(`  ${PASS} Fragrance lookup by ID API ${DIM}(200)${RST}`)
        } else {
          failed++
          const msg = idTestResult.msg
          failures.push({ label: 'Fragrance lookup by ID API', url: `${BASE_URL}/api/fragrances?id=${testId}`, msg })
          console.log(`  ${FAIL} Fragrance lookup by ID API ${DIM}— ${msg}${RST}`)
        }
      }
    }
  } catch (err) {
    // Silently skip this test if search fails — it's an enhancement, not a critical path
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
