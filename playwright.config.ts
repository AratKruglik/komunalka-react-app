import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STORAGE_STATE = join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'never' }], ['list']],

  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testDir: './tests/e2e',
      testIgnore: /auth\/.*/,
    },
    ...(process.env.CI
      ? [
          {
            name: 'firefox',
            use: {
              ...devices['Desktop Firefox'],
              storageState: STORAGE_STATE,
            },
            dependencies: ['setup'],
            testDir: './tests/e2e',
            testIgnore: /auth\/.*/,
          },
          {
            name: 'webkit',
            use: {
              ...devices['Desktop Safari'],
              storageState: STORAGE_STATE,
            },
            dependencies: ['setup'],
            testDir: './tests/e2e',
            testIgnore: /auth\/.*/,
          },
        ]
      : []),
    {
      name: 'chromium-no-auth',
      use: { ...devices['Desktop Chrome'] },
      testDir: './tests/e2e/auth',
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
