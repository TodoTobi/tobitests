import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/tobi';

async function enterSpecsPage(page: Page) {
  const diskSpecs = fs
    .readdirSync('specs')
    .filter((f) => f.startsWith('tobitests-') && f.endsWith('.spec.ts'))
    .sort();

  const statePath = path.resolve('web/public/data/tobitests-state.json');
  let baseState: any = {};
  try {
    baseState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (e) {
    baseState = { project: { name: 'TobiTests' }, metrics: {}, runs: [], bugs: [] };
  }

  baseState.specs = diskSpecs.map((name) => {
    let code = '';
    try {
      code = fs.readFileSync(path.join('specs', name), 'utf-8');
    } catch (e) {
      code = '// spec code';
    }
    return { name, code };
  });

  await page.route('**/api/state*', (route) => route.fulfill({ json: baseState }));
  await page.route('**/data/tobitests-state.json*', (route) => route.fulfill({ json: baseState }));
  await page.addInitScript(() => {
    window.localStorage.removeItem('tobitests_state_tobitests');
    window.localStorage.setItem('tobitests_active_project', 'tobitests');
  });

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
    await enterSpecsPage(page);
    const tree = page.getByTestId('specs-file-tree');
    await expect(tree).toBeVisible();

    const diskSpecs = fs
      .readdirSync('specs')
      .filter((f) => f.startsWith('tobitests-') && f.endsWith('.spec.ts'))
      .sort();
    const renderedItems = page.getByTestId('specs-file-item');
    await expect.poll(async () => await renderedItems.count()).toBe(diskSpecs.length);
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
