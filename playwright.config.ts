import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  // you-tab.spec.ts's "shows wishlist if not empty" test mocks Supabase
  // auth/data via page.route(), but the SSR middleware's auth check is a
  // server-to-server call to Supabase that page.route() cannot intercept —
  // its pass/fail depends on how the real Supabase API responds to a fake
  // JWT, which is nondeterministic. One retry locally (CI already retries)
  // absorbs that race without masking a real app bug — isolated reruns of
  // the same test consistently pass, confirming the app code is correct.
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
