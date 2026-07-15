/**
 * Playwright Configuration for PDF Tools Tests
 */

import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const BASE_PORT = new URL(BASE_URL).port || '3000';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  // Test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4, // 1 worker for CI to avoid overwhelming server
  
  // Reporting
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/report.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
    ['list'],
  ],
  
  // Timeout configuration
  timeout: 180000, // 3 minutes per test (increased from 2 minutes)
  expect: {
    timeout: 10000, // 10 seconds for expect assertions
  },

  // Use base URL
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.AUDIT_VIDEO === 'true' ? 'retain-on-failure' : 'off',
  },

  // Configure servers
  webServer: {
    // Launch Next directly so Playwright owns the actual server process. On Windows,
    // terminating an npm.cmd wrapper can otherwise leave Next running indefinitely.
    command: `node node_modules/next/dist/bin/next dev --webpack --port ${BASE_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test in Firefox and WebKit as well
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,
});
