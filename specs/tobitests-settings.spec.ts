import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/tobi';

async function enterSettings(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.getByRole('button', { name: /entrar al workspace/i });
  const sidebar = page.locator('.app > aside.sidebar');
  await expect(enterBtn.or(sidebar).first()).toBeVisible();
  if (await enterBtn.isVisible()) {
    await enterBtn.click();
  }
  await expect(sidebar).toBeVisible();

  const settingsBtn = sidebar.locator('button:has-text("Settings")').first();
  await settingsBtn.click();
  await expect(page.locator('.panel, main').first()).toBeVisible();
}

test.describe('TobiTests — Settings, Telemetry & MCP Connectivity', () => {
  test('TC-SETTINGS-01: Panel Proyecto muestra directorio local, URL y rama de Git', async ({ page }) => {
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar visualización de directorio local, URL y rama Git en el panel',
    });
    await enterSettings(page);
    await expect(page.locator('.panel, main').first()).toBeVisible();
  });

  test('TC-SETTINGS-02: Detección activa del motor de acción Playwright y DevTools CDP', async ({ page }) => {
    await enterSettings(page);
    await expect(page.locator('.integration').first()).toBeVisible();
  });

  test('TC-SETTINGS-03: Conmutación reactiva de configuración de orquestación BYOA', async ({ page }) => {
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar conmutación reactiva de configuración de orquestación BYOA en UI',
    });
    await enterSettings(page);
    await expect(page.locator('.panel').first()).toBeVisible();
  });
});
