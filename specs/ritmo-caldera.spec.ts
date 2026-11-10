import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';

test.describe('Ritmo Caldera Edition — Autonomous E2E QA & UX/UI Pro Max Audit', () => {
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

    // Verify root layout and primary components
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('header, [role="banner"]').first()).toBeVisible();

    // Verify Bottom Navigation tabs
    const navButtons = page.locator('nav button');
    await expect(navButtons.first()).toBeVisible();
    const navCount = await navButtons.count();
    expect(navCount).toBeGreaterThanOrEqual(4);

    // Verify FAB presence
    const fabButton = page.locator('button[aria-label*="nuevo"], button[aria-label*="bloque"], button[aria-label*="Crear"]');
    await expect(fabButton.first()).toBeVisible();

    await page.waitForTimeout(400);
    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-01-entry.png', fullPage: true });
  });

  test('TC-02: Calendar Month View & Month/Year Modal Navigation', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);

    // Trigger month selector modal by clicking month text in header
    const monthTrigger = page.locator('button:has-text("octubre 2026"), [aria-label*="selector de mes"]');
    if (await monthTrigger.count() > 0) {
      await monthTrigger.first().click();
      await page.waitForTimeout(400);

      // Verify modal is visible
      const modal = page.locator('[role="dialog"], #month-year-picker-title');
      await expect(modal.first()).toBeVisible();

      // Close modal
      const closeBtn = page.locator('[role="dialog"] button:has-text("Cerrar"), [role="dialog"] button[aria-label*="Cerrar"]');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click();
      }
    }

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-02-month-nav.png' });
  });

  test('TC-03: Event Interaction & Modals (Layer 2 Oracle)', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(600);

    // Click on an event card to open details
    const eventCard = page.locator('#agenda-section [role="button"], #agenda-section button:has-text("Devocional")').first();
    await eventCard.scrollIntoViewIfNeeded();
    await expect(eventCard).toBeVisible();
    await eventCard.click();
    await page.waitForTimeout(500);

    const detailModal = page.locator('[role="dialog"]').first();
    await expect(detailModal).toBeVisible();

    // Close modal
    const closeBtn = detailModal.locator('button[aria-label*="Cerrar"], button:has-text("Cerrar")').first();
    await closeBtn.click();
    await page.waitForTimeout(400);

    // Open Quick Add Modal via FAB
    const fabButton = page.locator('button[aria-label*="nuevo"], button[aria-label*="bloque"], button[aria-label*="Crear"]').first();
    await fabButton.click();
    await page.waitForTimeout(500);

    const quickAddModal = page.locator('[role="dialog"]').first();
    await expect(quickAddModal).toBeVisible();

    const cancelBtn = quickAddModal.locator('button:has-text("Cancelar"), button[aria-label*="Cerrar"]').first();
    await cancelBtn.click();

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-03-modals.png' });
  });

  test('TC-04: Timeline Tab Navigation & Tactile Grid', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(400);

    // Click Timeline Tab
    const timelineTab = page.locator('nav button:has-text("Línea Táctil")').first();
    await timelineTab.click();
    await page.waitForTimeout(500);

    // Verify main content loaded the timeline heading
    const timelineHeading = page.getByRole('heading', { name: 'Línea Táctil Magnética' });
    await expect(timelineHeading).toBeVisible();

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-04-timeline.png' });
  });

  test('TC-05: Notes Tab Navigation & Task Status Flow', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(400);

    // Click Notes Tab
    const notesTab = page.locator('nav button:has-text("Notas")').first();
    await notesTab.click();
    await page.waitForTimeout(500);

    // Verify notes container loaded category button
    const notesBtn = page.getByRole('button', { name: 'Del Día' });
    await expect(notesBtn).toBeVisible();

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-05-notes.png' });
  });

  test('TC-06: Settings Tab & System Philosophy Integrity', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(400);

    // Click Settings Tab
    const settingsTab = page.locator('nav button:has-text("Ajustes")').first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // Verify settings heading and integration indicators
    const settingsHeading = page.getByRole('heading', { name: 'Configuración del Asistente Ritmo' });
    await expect(settingsHeading).toBeVisible();

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-06-settings.png' });
  });

  test('TC-07: Responsive Mobile Viewport & No Horizontal Scroll (Layer 3 Oracle)', async ({ page }) => {
    // Audit on iPhone SE (375x812)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);

    // Check horizontal scroll overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-07-mobile-375.png', fullPage: true });

    // Audit on iPhone 14 Pro (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const overflow390 = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow390).toBe(false);

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-08-mobile-390.png', fullPage: true });
  });

  test('TC-08: UX/UI Pro Max Touch Target & Accessibility Audit', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);

    // Verify touch targets for navigation buttons are at least 38px
    const navButtons = page.locator('nav button');
    const count = await navButtons.count();
    for (let i = 0; i < count; i++) {
      const box = await navButtons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(38);
        expect(box.width).toBeGreaterThanOrEqual(38);
      }
    }

    // Verify FAB is well sized (>= 44px)
    const fab = page.locator('button[aria-label*="nuevo"], button[aria-label*="bloque"], button[aria-label*="Crear"]').first();
    const fabBox = await fab.boundingBox();
    if (fabBox) {
      expect(fabBox.width).toBeGreaterThanOrEqual(44);
      expect(fabBox.height).toBeGreaterThanOrEqual(44);
    }

    await page.screenshot({ path: 'web/public/evidence/runs/ritmo-caldera-09-touch-targets.png' });
  });
});
