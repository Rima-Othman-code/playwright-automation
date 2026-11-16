import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
  ],
  globalSetup: require.resolve('./src/global-setup'),
  globalTeardown: require.resolve('./src/global-teardown'),
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: null,
  },
  projects: [
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: {
        browserName: 'firefox',
        launchOptions: {
          args: ['--kiosk'],
        },
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://simple-books-api.click',
      },
    },
  ],
});
