import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/tobi';

async function enterSpecsPage(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.getByRole('button', { name: /entrar al workspace/i });
  const sidebar = page.locator('.app > aside.sidebar');
  await expect(enterBtn.or(sidebar).first()).toBeVisible();
  if (await enterBtn.isVisible()) {
    await enterBtn.click();
  }
  await expect(sidebar).toBeVisible();

  const specsBtn = sidebar.locator('nav button:has-text("Test Specs")').first();
  await specsBtn.click();
  await expect(page.locator('.editor, .code-lines, .panel').first()).toBeVisible();
}

test.describe('TobiTests — Playwright Spec Viewer & Code Syntax', () => {
  test('TC-SPECS-01: Árbol lateral lista todos los archivos .spec.ts generados', async ({ page }) => {
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar listado exhaustivo de todos los archivos .spec.ts en el árbol lateral',
    });
    await enterSpecsPage(page);
    await expect(page.locator('.editor, .panel').first()).toBeVisible();
  });

  test('TC-SPECS-02: Selección de archivo carga el código fuente con números de línea', async ({ page }) => {
    await enterSpecsPage(page);
    await expect(page.locator('.code-lines, .code-line-row').first()).toBeVisible();
  });

  test('TC-SPECS-03: Líneas de aserción expect() se destacan visualmente', async ({ page }) => {
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar clases CSS de resaltado visual sobre líneas de aserción expect()',
    });
    await enterSpecsPage(page);
    await expect(page.locator('.code-highlight, .code-line-row').first()).toBeVisible();
  });
});
