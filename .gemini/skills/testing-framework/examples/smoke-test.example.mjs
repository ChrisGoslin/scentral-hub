#!/usr/bin/env node
import * as http from 'node:http'
import * as https from 'node:https'

/**
 * smoke-test.example.mjs
 * Fast HTTP smoke test for deployment verification
 *
 * Usage:
 *   node scripts/smoke-test.mjs
 *   BASE_URL=https://preview.url node scripts/smoke-test.mjs
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Define critical routes to test
const ROUTES = [
  // [path, expected status, description]
  ['/',                200, 'Landing page'],
  ['/discover',        200, 'Discover/catalogue'],
  ['/collection',      200, 'User collection'],
  ['/layering',        200, 'Layering lab'],
  ['/you',             200, 'User profile'],
  ['/onboarding',      200, 'Onboarding flow'],
  ['/api/fragrances?q=test', 200, 'Search API'],
  ['/api/waitlist',    405, 'Waitlist API (POST-only)'],
  ['/api/wear',        405, 'Wear API (POST-only)'],
]

const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'
const DIM  = '\x1b[2m'
const RST  = '\x1b[0m'

async function testRoute(route) {
  return new Promise((resolve) => {
    const client = BASE_URL.startsWith('https') ? https : http
    const startTime = Date.now()

    client.get(`${BASE_URL}${route[0]}`, (res) => {
      const duration = Date.now() - startTime
      const ok = res.statusCode === route[1] && duration < 10_000
      resolve({
        route: route[2],
        status: res.statusCode,
        expected: route[1],
        duration: `${duration}ms`,
        ok
      })
    }).on('error', (err) => {
      resolve({
        route: route[2],
        status: 'ERROR',
        expected: route[1],
        duration: '-',
        ok: false,
        error: err.message
      })
    }).on('timeout', () => {
      resolve({
        route: route[2],
        status: 'TIMEOUT',
        expected: route[1],
        duration: '10000ms+',
        ok: false,
        error: 'Request timed out'
      })
    }).setTimeout(10_000)
  })
}

async function main() {
  console.log(`\n${DIM}Smoke Tests ${BASE_URL}${RST}\n`)

  let passed = 0
  let failed = 0
  const failures = []

  for (const route of ROUTES) {
    const result = await testRoute(route)
    if (result.ok) {
      passed++
      console.log(`  ${PASS} ${result.route.padEnd(30)} ${DIM}(${result.status}) ${result.duration}${RST}`)
    } else {
      failed++
      const msg = `Expected ${result.expected}, got ${result.status}`
      failures.push({ ...result, msg })
      console.log(`  ${FAIL} ${result.route.padEnd(30)} ${DIM}— ${msg}${RST}`)
    }
  }

  console.log(`\n  ${passed} passed · ${failed} failed\n`)

  if (failures.length > 0) {
    console.log('Failures:')
    for (const failure of failures) {
      console.log(`  • ${failure.route}`)
      console.log(`    ${DIM}${BASE_URL}${ROUTES.find(r => r[2] === failure.route)?.[0] || '?'}${RST}`)
      console.log(`    ${failure.msg}`)
      if (failure.error) console.log(`    Error: ${failure.error}`)
    }
    console.log()
    process.exit(1)
  }
}

main()
