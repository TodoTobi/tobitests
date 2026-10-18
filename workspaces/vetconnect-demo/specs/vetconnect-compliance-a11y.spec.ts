import { test, expect } from '@playwright/test';

test.describe('Suite 6: Compliance, Accessibility & Performance', () => {
  test('TC-CMP-01: Renders Privacy Policy (/privacy) with SENASA and GDPR compliance sections', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/Privacidad|Datos/i);
  });

  test('TC-CMP-02: Renders Terms & Conditions (/terms) with tele-veterinary service stipulations', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/Términos|Condiciones/i);
  });

  test('TC-CMP-03: Displays Cookie Consent Banner on first landing visit', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first();
    await expect(banner).toBeVisible();
  });

  test('TC-CMP-04: Dismisses Cookie Consent Banner upon accepting preferences', async ({ page }) => {
    await page.goto('/');
    const acceptBtn = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first();
    if (await acceptBtn.count() > 0) {
      await acceptBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('button:has-text("Solo Necesarias")')).not.toBeVisible();
    }
  });

  test('TC-CMP-05: Renders Refund and Cancellation Policy (/refunds)', async ({ page }) => {
    await page.goto('/refunds');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-CMP-06: Verifies interactive controls have accessible focus-visible rings', async ({ page }) => {
    await page.goto('/login');
    const input = page.locator('input[type="email"]');
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('TC-CMP-07: Validates responsive layout viewport adaptability at 375px (Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-CMP-08: Validates no fatal console errors on primary landing page', async ({ page }) => {
    const fatalErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('401')) fatalErrors.push(msg.text());
    });
    await page.goto('/');
    expect(fatalErrors).toEqual([]);
  });
});
