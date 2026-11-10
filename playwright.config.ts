import fs from 'fs';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const projectSlug = process.env.TOBI_PROJECT || 'tobitests';

let stateUrl = '';
try {
  const statePath = path.resolve(__dirname, `./web/public/data/${projectSlug}-state.json`);
  if (fs.existsSync(statePath)) {
    const raw = fs.readFileSync(statePath, 'utf8');
    const parsed = JSON.parse(raw);
    stateUrl = parsed?.project?.url || '';
  }
} catch (e) {}

const defaultUrl = 'http://localhost:5180';
const targetUrl = process.env.TARGET_URL || process.env.BASE_URL || stateUrl || defaultUrl;

const isTobitestsDefault = (projectSlug === 'tobitests' || projectSlug === 'tobi') && targetUrl === defaultUrl;

const testMatch = (projectSlug === 'tobitests' || projectSlug === 'tobi')
  ? ['tobitests-*.spec.ts']
  : [`${projectSlug}*.spec.ts`, `custom-${projectSlug}*.spec.ts`];

export default defineConfig({
  testDir: './specs',
  testMatch,
  timeout: 45000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/report.json' }],
    ['./reporters/tobi-steps-reporter.ts'],
  ],
  use: {
    baseURL: targetUrl,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
    },
  },
  ...(isTobitestsDefault ? {
    webServer: {
      command: 'npm run dev --prefix web',
      url: defaultUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
  } : {}),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
