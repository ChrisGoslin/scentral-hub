import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Single shared dev server (one `webServer` instance below) serving all
  // parallel workers, each hitting the live 127k-row Supabase catalogue —
  // under default local concurrency (5 workers), you-tab.spec.ts's
  // "shows wishlist if not empty" intermittently missed its 20s timeout
  // waiting on a response from the contended server. Root-caused by
  // elimination, not guessed: capping to 2 workers still failed 1/3 runs;
  // workers:1 (fully serial) passed 3/3 clean runs in ~44s each, no
  // meaningful slowdown for this suite's size. The test in isolation
  // (any worker count) always passed instantly — confirms this is pure
  // server contention, not app code or the E2E_AUTH_BYPASS mock.
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'env -u FORCE_COLOR npm run start:e2e',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: process.env.PW_REUSE_SERVER === '1',
  },
});
