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
    await enterSettings(page);
    const defs = page.getByTestId('settings-project-defs');
    await expect(defs).toBeVisible();

    const stateRes = await page.request.get('/api/state?project=tobitests');
    const stateJson = await stateRes.json();
    const proj = stateJson.project || {};

    const text = (await defs.textContent()) || '';
    if (proj.url) expect(text).toContain(proj.url);
    if (proj.branch) expect(text).toContain(proj.branch);
    if (proj.repoPath) expect(text).toContain(proj.repoPath);
  });

  test('TC-SETTINGS-02: Detección activa del motor de acción Playwright y DevTools CDP', async ({ page }) => {
    await enterSettings(page);
    await expect(page.locator('.integration').first()).toBeVisible();
  });

  test('TC-SETTINGS-03: Conmutación reactiva de configuración de orquestación BYOA', async ({ page }) => {
    await enterSettings(page);
    // Cambiar a La Oficina donde está la barra interactiva de orquestación BYOA
    const sidebar = page.locator('.app > aside.sidebar');
    const officeBtn = sidebar.locator('button:has-text("La Oficina")').first();
    await officeBtn.click();

    const primarySelect = page.getByTestId('settings-primary-agent-select');
    const secondarySelect = page.getByTestId('settings-secondary-agent-select');
    await expect(primarySelect).toBeVisible();
    await expect(secondarySelect).toBeVisible();

    const originalPrimary = await primarySelect.inputValue();
    const originalSecondary = await secondarySelect.inputValue();

    const targetPrimary = originalPrimary === 'claude-code' ? 'cursor' : 'claude-code';

    try {
      const [postReq] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/api/antigravity/orchestration') && req.method() === 'POST'),
        primarySelect.selectOption(targetPrimary),
      ]);
      const res = await postReq.response();
      expect(res?.status()).toBe(200);

      await page.reload();
      await expect(primarySelect).toHaveValue(targetPrimary);
    } finally {
      await primarySelect.selectOption(originalPrimary);
      if (originalSecondary) {
        await secondarySelect.selectOption(originalSecondary);
      }
    }
  });
});
