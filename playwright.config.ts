import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.ENV || 'dev'}` });

export default defineConfig({
  // Directory where tests are located
  testDir: './tests',

  // Run all tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers; use 1 on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
    }],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation shortcuts like page.goto('/')
    baseURL: process.env.BASE_URL || '',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Browser locale
    locale: 'en-US',

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Timeout for each action (click, fill, etc.)
    actionTimeout: 10_000,

    // Timeout for navigations
    navigationTimeout: 30_000,

    testIdAttribute: "data-cy"
  },

  // Global test timeout
  timeout: 60_000,

  // Expect assertion timeout
  expect: {
    timeout: 10_000,
  },

  // Output folder for test artifacts
  outputDir: 'test-results',

  // Browser projects
  projects: [
    // ── Auth setup (runs once, produces saved session files) ──────────────────
    {
      name: 'smart-setup',
      testMatch: '**/setup/*.setup.ts',
    },

    // ── Smart app (reuses saved session — no UI login per test) ───────────────
    {
      name: 'smart-chromium',
      testMatch: '**/e2e/*+(activities|notes)*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/activity-user.json',
      },
      dependencies: ['smart-setup'],
    },

    // ── SauceDemo (no saved session needed) ───────────────────────────────────
    {
      name: 'chromium',
      testIgnore: '**/e2e/*+(activities|notes)*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: '**/e2e/*+(activities|notes)*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
