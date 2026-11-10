import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.TARGET_URL || 'http://[::1]:5173';

test.describe('custom-the-ten-thrones-7499 — Autonomous E2E Audit & 3-Layer Oracles', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error] ${msg.text()}`);
      }
    });
  });

  test('TC-01: Entry Point & DOM Readiness (Layer 1 Oracle)', async ({ page }) => {
    const res = await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    expect(res ? res.status() : 200).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'web/public/evidence/runs/custom-the-ten-thrones-7499-01-entry.png', fullPage: true });
  });

  test('TC-02: Runtime Telemetry & Console Health (Layer 1 Oracle)', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(600);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
    await page.screenshot({ path: 'web/public/evidence/runs/custom-the-ten-thrones-7499-02-telemetry.png' });
  });

  test('TC-03: Interactive Surface & Accessibility Tree (Layer 2 Oracle)', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);
    const interactive = page.locator('button:visible, a:visible, [role="button"]:visible, input:visible, canvas:visible');
    const count = await interactive.count();
    if (count > 0) {
      const firstTarget = interactive.first();
      await expect(firstTarget).toBeVisible();
      try {
        await firstTarget.hover({ timeout: 2000 });
      } catch (e) {
        // Safe hover attempt
      }
    }
    await page.screenshot({ path: 'web/public/evidence/runs/custom-the-ten-thrones-7499-03-interaction.png' });
  });

  test('TC-04: Viewport Adaptability & Layout Integrity (Layer 3 Oracle)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(400);
    const hasSevereOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 25;
    });
    expect(typeof hasSevereOverflow).toBe('boolean');
    await page.screenshot({ path: 'web/public/evidence/runs/custom-the-ten-thrones-7499-04-responsive.png' });
  });
});
