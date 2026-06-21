import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration Example
 *
 * Configures:
 * - Test directory and discovery
 * - Browser coverage (desktop + mobile)
 * - Retry and timeout settings
 * - Development server integration
 * - Reporting and tracing
 */

export default defineConfig({
  // Test file discovery
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  // Global settings
  fullyParallel: true,          // Run tests in parallel
  forbidOnly: !!process.env.CI, // Fail if .only left in code
  retries: process.env.CI ? 2 : 0,  // Retry 2x in CI, 0x locally
  workers: process.env.CI ? 1 : undefined,  // 1 worker in CI, auto in dev
  reporter: 'list',             // Simple reporter

  // Timeouts
  timeout: 30 * 1000,           // Per test: 30 seconds
  expect: {
    timeout: 5000               // Assertion timeout: 5 seconds
  },

  // Base configuration for all tests
  use: {
    // Base URL for page.goto('/path') and page.goto('http://localhost:3000/path')
    baseURL: 'http://localhost:3000',

    // Navigation settings
    navigationTimeout: 30000,
    actionTimeout: 10000,

    // Tracing: record on first retry for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Define browser projects (desktop + mobile)
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Add Chromium-specific settings
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],  // 393×851 viewport
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],  // 390×844 viewport
      },
    },
  ],

  // Start dev server before tests
  webServer: {
    // Command to start dev server
    command: 'npm run dev',

    // URL to wait for
    url: 'http://localhost:3000',

    // Reuse running server if already started
    reuseExistingServer: !process.env.CI,

    // Timeout waiting for server to start
    timeout: 120_000,
  },
});

/**
 * USAGE:
 *
 * Run all tests:
 *   npm run test:e2e
 *
 * Run with browser visible:
 *   npm run test:e2e:headed
 *
 * Run specific test:
 *   npx playwright test -g "search"
 *
 * Debug test:
 *   npx playwright test --debug
 *
 * View traces:
 *   npx playwright show-trace trace.zip
 *
 * BROWSER PROJECTS:
 *
 * Run only desktop:
 *   npx playwright test --project=chromium
 *
 * Run only mobile:
 *   npx playwright test --project="Mobile Chrome"
 *
 * Run specific test on all browsers:
 *   npx playwright test e2e/onboarding.spec.ts
 *
 * CI OPTIMIZATION:
 *
 * In CI, run only critical tests on one browser:
 *   npx playwright test --project=chromium
 *
 * Then run full suite locally or nightly:
 *   npm run test:e2e  (runs all browsers)
 *
 * CUSTOMIZATION:
 *
 * Skip test on specific browser:
 *   test.skip(browserName === 'webkit', 'Skip on Safari');
 *
 * Increase timeout for slow test:
 *   test('slow test', async ({ page }) => {
 *     test.setTimeout(60000);  // 60 seconds
 *     await page.goto('/slow-page');
 *   });
 *
 * Mock API responses:
 *   await page.route('**/api/search', route => {
 *     route.fulfill({ status: 200, body: JSON.stringify([]) });
 *   });
 */
