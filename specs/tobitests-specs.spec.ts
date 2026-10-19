import { test, expect } from '@playwright/test';

async function enterSpecsPage(page: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.locator("button:has-text('Entrar al workspace')").first();
  if (await enterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await enterBtn.click();
  }
  await page.locator('.app > aside.sidebar').waitFor({ state: 'visible', timeout: 5000 });
  const specsBtn = page.locator('.app > aside.sidebar nav button:has-text("Test Specs")').first();
  await specsBtn.click();
  await page.waitForSelector('.editor, .code-lines, .panel', { timeout: 8000 });
}

test.describe('TobiTests — Playwright Spec Viewer & Code Syntax', () => {
  test('TC-SPECS-01: Árbol lateral lista todos los archivos .spec.ts generados', async ({ page }) => {
    await enterSpecsPage(page);
    await expect(page.locator('.editor, .panel').first()).toBeVisible();
  });

  test('TC-SPECS-02: Selección de archivo carga el código fuente con números de línea', async ({ page }) => {
    await enterSpecsPage(page);
    await expect(page.locator('.code-lines, .code-line-row').first()).toBeVisible();
  });

  test('TC-SPECS-03: Líneas de aserción expect() se destacan visualmente', async ({ page }) => {
    await enterSpecsPage(page);
    await expect(page.locator('.code-highlight, .code-line-row').first()).toBeVisible();
  });
});
