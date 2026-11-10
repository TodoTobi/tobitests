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
    test.fixme(true, 'Hallazgo de sincronización: el árbol lateral renderiza 5 specs de tobitests-state.json mientras que specs/ contiene 10 archivos *.spec.ts en disco');
    test.info().annotations.push({
      type: 'weak-oracle',
      description: 'Verificar listado exhaustivo de todos los archivos .spec.ts en el árbol lateral',
    });
    await enterSpecsPage(page);
    const tree = page.getByTestId('specs-file-tree');
    await expect(tree).toBeVisible();

    const fs = await import('fs');
    const diskSpecs = fs.readdirSync('specs').filter((f) => f.endsWith('.spec.ts')).sort();
    const renderedItems = page.getByTestId('specs-file-item');
    const renderedNames = (await renderedItems.allTextContents()).map((t) => t.trim()).sort();
    expect(renderedNames).toEqual(diskSpecs);
  });

  test('TC-SPECS-02: Selección de archivo carga el código fuente con números de línea', async ({ page }) => {
    await enterSpecsPage(page);
    await expect(page.locator('.code-lines, .code-line-row').first()).toBeVisible();
  });

  test('TC-SPECS-03: Líneas de aserción expect() se destacan visualmente', async ({ page }) => {
    await enterSpecsPage(page);
    const assertLines = page.getByTestId('specs-line-assert');
    await expect.poll(async () => await assertLines.count()).toBeGreaterThan(0);

    const count = await assertLines.count();
    for (let i = 0; i < count; i++) {
      const lineText = (await assertLines.nth(i).textContent()) || '';
      expect(lineText).toContain('expect(');
    }

    const plainLines = page.locator('.code-line-row code:not([data-testid="specs-line-assert"])');
    expect(await plainLines.count()).toBeGreaterThan(0);
  });
});
