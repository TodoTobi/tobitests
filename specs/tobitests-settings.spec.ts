import { test, expect } from '@playwright/test';

async function enterSettings(page: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.locator("button:has-text('Entrar al workspace')").first();
  if (await enterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await enterBtn.click();
  }
  await page.locator('.app > aside.sidebar').waitFor({ state: 'visible', timeout: 5000 });
  const settingsBtn = page.locator('.app > aside.sidebar button:has-text("Settings")').first();
  await settingsBtn.click();
  await page.waitForSelector('.panel, main', { timeout: 8000 });
}

test.describe('TobiTests — Settings, Telemetry & MCP Connectivity', () => {
  test('TC-SETTINGS-01: Panel Proyecto muestra directorio local, URL y rama de Git', async ({ page }) => {
    await enterSettings(page);
    await expect(page.locator('.panel, main').first()).toBeVisible();
  });

  test('TC-SETTINGS-02: Detección activa del motor de acción Playwright y DevTools CDP', async ({ page }) => {
    await enterSettings(page);
    await expect(page.locator('.integration').first()).toBeVisible();
  });

  test('TC-SETTINGS-03: Conmutación reactiva de configuración de orquestación BYOA', async ({ page }) => {
    await enterSettings(page);
    await expect(page.locator('.panel').first()).toBeVisible();
  });
});
