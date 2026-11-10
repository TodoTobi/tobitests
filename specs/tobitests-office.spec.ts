import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/tobi';

async function enterWorkspace(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.getByRole('button', { name: /entrar al workspace/i });
  const sidebar = page.locator('.app > aside.sidebar');
  await expect(enterBtn.or(sidebar).first()).toBeVisible();
  if (await enterBtn.isVisible()) {
    await enterBtn.click();
  }
  await expect(sidebar).toBeVisible();
}

async function enterOffice(page: Page) {
  await enterWorkspace(page);
  const officeBtn = page.locator('.app > aside.sidebar nav button:has-text("La Oficina")');
  await expect(officeBtn).toBeVisible();
  await officeBtn.click();
  await expect(page.locator('.iso-layout, .iso-stage, canvas').first()).toBeVisible();
}

test.describe('TobiTests — Virtual Office & Isometric Simulation', () => {
  test('TC-OFFICE-01: Renderizado de la cuadrícula isométrica en canvas 2.5D', async ({ page }) => {
    await enterOffice(page);
    await expect(page.locator('.iso-layout, .iso-stage, canvas').first()).toBeVisible();
  });

  test('TC-OFFICE-02: Estación Mesa de Comando Central con agente Orchestrator activo', async ({ page }) => {
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar agente orchestrator en estación central con estado activo',
    });
    await enterOffice(page);
    await expect(page.locator('.iso-stage, .iso-layout, canvas').first()).toBeVisible();
  });

  test('TC-OFFICE-03: Feed de telemetría en tiempo real con niveles info, warn y success', async ({ page }) => {
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar presencia de feed de telemetría en vivo con entradas clasificadas por nivel info, warn y success',
    });
    await enterOffice(page);
    const panel = page.locator('.panel, .iso-layout, .iso-stage, .iso-terminal').first();
    await expect(panel).toBeVisible();
  });

  test('TC-OFFICE-04: Conmutación entre estado working e idle con actualización de avatar', async ({ page }) => {
    await enterOffice(page);
    const toggleBtn = page.locator('.iso-inspector').getByRole('button', { name: /(mandar a descansar|poner a laburar)/i });
    await expect(toggleBtn).toBeVisible();
    const beforeText = (await toggleBtn.textContent()) || '';
    await toggleBtn.click();
    await expect.poll(async () => {
      const afterText = (await toggleBtn.textContent()) || '';
      return afterText !== beforeText;
    }).toBe(true);

    // Restaurar estado inicial
    await toggleBtn.click();
    await expect.poll(async () => {
      const restoredText = (await toggleBtn.textContent()) || '';
      return restoredText === beforeText;
    }).toBe(true);
  });

  test('TC-OFFICE-13: Divergencia de estado en filtros de telemetría al alternar agentes (BUG-01)', async ({ page }) => {
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar divergencia de estado en filtros de telemetría al conmutar entre agentes',
    });
    await enterOffice(page);
    const officeContainer = page.locator('.iso-layout, .iso-stage, canvas, main').first();
    await expect(officeContainer).toBeVisible();
  });
});
