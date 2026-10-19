import { defineConfig, devices } from '@playwright/test';

const targetUrl = process.env.TARGET_URL || process.env.BASE_URL || 'http://localhost:5180';
const isCustomTarget = targetUrl !== 'http://localhost:5180' && !targetUrl.includes(':5180');

export default defineConfig({
  testDir: './specs',
  timeout: 45000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/report.json' }],
  ],
  use: {
    baseURL: targetUrl,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on',
  },
  ...(isCustomTarget ? {} : {
    webServer: {
      command: 'npm run dev --prefix web',
      url: 'http://localhost:5180',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
  }),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
