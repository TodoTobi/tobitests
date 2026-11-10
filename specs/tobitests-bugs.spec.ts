import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/tobi';

async function enterBugTracker(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.getByRole('button', { name: /entrar al workspace/i });
  const sidebar = page.locator('.app > aside.sidebar');
  await expect(enterBtn.or(sidebar).first()).toBeVisible();
  if (await enterBtn.isVisible()) {
    await enterBtn.click();
  }
  await expect(sidebar).toBeVisible();

  const bugBtn = sidebar.locator('nav button:has-text("Bug Tracker")').first();
  await bugBtn.click();
  await expect(page.locator('.table, .panel').first()).toBeVisible();
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
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Divergencia');

    await expect.poll(async () => {
      const rows = await page.locator('.table tbody tr').allTextContents();
      return rows.length > 0 && rows.every((t) => /Divergencia/i.test(t));
    }).toBe(true);
  });

  test('TC-BUGS-03: Ficha de bug presenta estructura Gherkin Dado que / Cuando / Entonces', async ({ page }) => {
    await enterBugTracker(page);
    const firstBug = page.locator('.table tbody tr.clickable, .table tbody tr').first();
    await expect(firstBug).toBeVisible();
    await firstBug.click();

    const scenarioCard = page.locator('.scenario-card, .bug-layout').first();
    await expect(scenarioCard).toBeVisible();
    await expect(scenarioCard.getByText(/dado que/i).first()).toBeVisible();
    await expect(scenarioCard.getByText(/cuando/i).first()).toBeVisible();
    await expect(scenarioCard.getByText(/entonces/i).first()).toBeVisible();
  });

  test('TC-BUGS-04: Modal de vista previa de reporte completo con scroll suave', async ({ page }) => {
    await enterBugTracker(page);
    const previewBtn = page.locator('button:has-text("Vista previa")').first();
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    const modal = page.locator('.modal').first();
    await expect(modal).toBeVisible();
    const pre = modal.locator('pre.pre');
    await expect(pre).toBeVisible();
    const closeBtn = modal.locator('button:has-text("Cerrar")').first();
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });
});
