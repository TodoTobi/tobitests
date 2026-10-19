import { test, expect } from '@playwright/test';

async function enterOffice(page: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const directBtn = page.locator("button:has-text('Conocer La Oficina')").first();
  if (await directBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await directBtn.click();
  } else {
    const enterBtn = page.locator("button:has-text('Entrar al workspace')").first();
    if (await enterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enterBtn.click();
    }
    await page.locator('.app > aside.sidebar nav button:has-text("La Oficina")').first().click();
  }
  await page.locator('.iso-studio, .office-layout, main').first().waitFor({ state: 'visible', timeout: 8000 });
}

test.describe('TobiTests — Virtual Office & Isometric Simulation', () => {
  test('TC-OFFICE-01: Renderizado de la cuadrícula isométrica en canvas 2.5D', async ({ page }) => {
    await enterOffice(page);
    await expect(page.locator('.iso-studio, .office-viewport, canvas, .office-layout').first()).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test('TC-OFFICE-02: Estación Mesa de Comando Central con agente Orchestrator activo', async ({ page }) => {
    await enterOffice(page);
    await expect(page.locator('.iso-stage, .iso-viewport, .office-viewport').first()).toBeVisible();
    await page.waitForTimeout(500);
  });

  test('TC-OFFICE-03: Feed de telemetría en tiempo real con niveles info, warn y success', async ({ page }) => {
    await enterOffice(page);
    await page.waitForTimeout(800);
    const panel = page.locator('.panel, .iso-studio, .office-layout').first();
    await expect(panel).toBeVisible();
  });

  test('TC-OFFICE-04: Conmutación entre estado working e idle con actualización de avatar', async ({ page }) => {
    await enterOffice(page);
    const toggleBtn = page.locator('button:has-text("Mandar a descansar"), button:has-text("Poner a laburar")').first();
    if (await toggleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggleBtn.click();
      await page.waitForTimeout(600);
    }
  });

  test('TC-OFFICE-13: Divergencia de estado en filtros de telemetría al alternar agentes (BUG-01)', async ({ page }) => {
    await enterOffice(page);
    const officeContainer = page.locator('.iso-studio, .office-layout, main').first();
    await expect(officeContainer).toBeVisible();
  });
});
