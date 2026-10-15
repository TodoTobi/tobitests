import { test, expect } from '@playwright/test';

test.describe('Sample Domain - Smoke & Health Check', () => {
  test('should load landing page without uncaught runtime errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Validate page has loaded
    await expect(page).toHaveTitle(/.+/);

    // Expect no critical runtime errors on load
    expect(consoleErrors).toEqual([]);
  });
});
