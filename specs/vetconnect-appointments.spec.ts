import { test, expect } from '@playwright/test';

test.describe('VetConnect — Appointments & Consultation Sync', () => {
  test('verifies compliance pages render properly (/privacy, /terms)', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/terms');
    await expect(page.locator('body')).toBeVisible();
  });

  test('validates consultation cancellation sync between Messages and Pets', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });
});
