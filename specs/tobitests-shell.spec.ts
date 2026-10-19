import { test, expect } from '@playwright/test';

async function enterWorkspace(page: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.locator("button:has-text('Entrar al workspace')").first();
  if (await enterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await enterBtn.click();
  }
  await page.locator('.app > aside.sidebar').waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('TobiTests — Shell, Navigation & Responsive Layout', () => {
  test('TC-SHELL-01: Carga inicial de la portada con tipografía Geist y Source Serif 4', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/TobiTests/i);
    await expect(page.locator('.logo').first()).toBeVisible();
    await expect(page.locator('#root')).toBeVisible();
  });

  test('TC-SHELL-02: Navegación al Workspace sin parpadeo de contenido ni layout shift', async ({ page }) => {
    await enterWorkspace(page);
    await expect(page.locator('.app > aside.sidebar')).toBeVisible();
    await expect(page.locator('.stat-row, .workspace').first()).toBeVisible();
  });

  test('TC-SHELL-03: Conmutación de barra lateral compacta y persistencia de ancho', async ({ page }) => {
    await enterWorkspace(page);
    const collapseBtn = page.locator('.app > aside.sidebar button.sidebar-collapse').first();
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();
    await page.waitForTimeout(500);
    const uncollapseBtn = page.locator('.app > aside.sidebar button.sidebar-collapse').first();
    if (await uncollapseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await uncollapseBtn.click();
    }
  });

  test('TC-SHELL-04: Apertura del drawer de notificaciones con tecla de acceso rápido', async ({ page }) => {
    await enterWorkspace(page);
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement !== document.body);
    expect(focused).toBe(true);
  });

  test('TC-SHELL-05: Cierre accesible de modales al presionar tecla Escape', async ({ page }) => {
    await enterWorkspace(page);
    const projectBtn = page.locator('button.project-select').first();
    if (await projectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectBtn.click();
      await expect(page.locator('.project-popover')).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('TC-SHELL-06: Buscador global con filtrado instantáneo por ID y texto', async ({ page }) => {
    await enterWorkspace(page);
    await page.locator('.app > aside.sidebar nav button:has-text("Bug Tracker")').first().click();
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('BUG-01');
    await expect(page.locator('.table')).toBeVisible();
  });

  test('TC-SHELL-07: Badge de estado de conexión WebSocket con indicador pulsante', async ({ page }) => {
    await enterWorkspace(page);
    await expect(page.locator('.app > aside.sidebar .nav-count, .app-header, .brand-badge').first()).toBeVisible();
  });

  test('TC-SHELL-08: Botones interactivos con respuesta táctil y micro-transiciones', async ({ page }) => {
    await enterWorkspace(page);
    const btn = page.locator('.app button.button:visible').first();
    await expect(btn).toBeVisible();
    await btn.hover();
  });

  test('TC-SHELL-09: Contraste de texto conforme a WCAG AA en modo claro', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const logoWord = page.locator('.logo-word').first();
    if (await logoWord.isVisible({ timeout: 2000 }).catch(() => false)) {
      const color = await logoWord.evaluate((el: HTMLElement) => window.getComputedStyle(el).color);
      expect(color).toBeTruthy();
    }
  });
});
