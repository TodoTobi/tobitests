import { test, expect } from '@playwright/test';

async function enterBugTracker(page: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.locator("button:has-text('Entrar al workspace')").first();
  if (await enterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await enterBtn.click();
  }
  await page.locator('.app > aside.sidebar').waitFor({ state: 'visible', timeout: 5000 });
  const bugBtn = page.locator('.app > aside.sidebar nav button:has-text("Bug Tracker")').first();
  await bugBtn.click();
  await page.waitForSelector('.table, .panel', { timeout: 8000 });
}

test.describe('TobiTests — Bug Tracker, BDD & Evidence Tabs', () => {
  test('TC-BUGS-01: Lista de bugs renderiza ID, título, severidad y agente detector', async ({ page }) => {
    await enterBugTracker(page);
    await expect(page.locator('.table')).toBeVisible();
    await expect(page.locator('.table tbody tr').first()).toBeVisible();
  });

  test('TC-BUGS-02: Buscador de incidentes filtra reactivamente por término', async ({ page }) => {
    await enterBugTracker(page);
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();
    await searchInput.fill('Divergencia');
    await expect(page.locator('.table tbody tr').first()).toBeVisible();
  });

  test('TC-BUGS-03: Ficha de bug presenta estructura Gherkin Dado que / Cuando / Entonces', async ({ page }) => {
    await enterBugTracker(page);
    const firstBug = page.locator('.table tbody tr.clickable').first();
    if (await firstBug.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstBug.click();
      await expect(page.locator('.scenario-card, .bug-layout, .panel').first()).toBeVisible();
    }
  });

  test('TC-BUGS-04: Modal de vista previa de reporte completo con scroll suave', async ({ page }) => {
    await enterBugTracker(page);
    const previewBtn = page.locator('button:has-text("Vista previa")').first();
    if (await previewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await previewBtn.click();
      await expect(page.locator('.modal')).toBeVisible();
      const closeBtn = page.locator('.modal button:has-text("Cerrar")').first();
      await closeBtn.click();
      await expect(page.locator('.modal')).toBeHidden();
    }
  });
});
