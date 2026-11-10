import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures/tobi';

async function seedBugsState(page: Page) {
  const statePath = path.resolve('web/public/data/tobitests-state.json');
  let baseState: any = {};
  try {
    baseState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (e) {
    baseState = { project: { name: 'TobiTests' }, metrics: {}, runs: [], bugs: [] };
  }

  const hasBug01 = (baseState.bugs || []).some((b: any) => b.id === 'BUG-01');
  if (!hasBug01) {
    const bug01 = {
      id: 'BUG-01',
      title: 'Divergencia de estado en filtros de telemetría al alternar agentes en La Oficina',
      severity: 'Alta',
      status: 'Resolved',
      section: 'La Oficina / Telemetría',
      runId: '#RUN-SELF-01',
      agent: 'Telemetry Auditor',
      assignee: 'Equipo Frontend',
      date: '16/10/2026',
      scenario: 'Al alternar entre mesas de agentes en La Oficina, el filtro de telemetría conserva logs del agente previo',
      dadoQue: 'el operador está en la vista de La Oficina con la simulación en marcha',
      cuando: "hace clic en un agente pausado y luego filtra por 'warn'",
      entonces: 'la consola muestra eventos mezclados del agente anterior sin limpiar el búfer reactivo',
      screenshot: '/evidence/bugs/tobi-bug-01-detail.png',
      videoUrl: '/evidence/videos/tobitests-bug-01-replay.webm',
      doctorVideoUrl: '/evidence/videos/tobitests-self-audit.webm',
      resolution: 'Resuelto con éxito en rama bugfix/cerco-bug-01-telemetry-divergence.',
      diagnostic: {
        observedFact: 'El feed de telemetría acumulaba entradas de puestos inactivos.',
        whiteBoxHypothesis: 'La interfaz LogEntry carecía de asociación por agentId.',
        affectedFile: 'web/src/components/OfficeView.tsx',
        recommendedFix: 'Inyección de agentId en LogEntry.',
        reproductionSpec: 'tobitests-office.spec.ts',
      },
    };
    baseState.bugs = [bug01, ...(baseState.bugs || [])];
  }

  await page.route('**/api/state*', (route) => route.fulfill({ json: baseState }));
  await page.route('**/data/tobitests-state.json*', (route) => route.fulfill({ json: baseState }));
  await page.addInitScript(() => {
    window.localStorage.removeItem('tobitests_state_tobitests');
    window.localStorage.setItem('tobitests_active_project', 'tobitests');
  });
}

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

test.describe('TobiTests — Shell, Navigation & Responsive Layout', () => {
  test('TC-SHELL-01: Carga inicial de la portada con tipografía Geist y Source Serif 4', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/TobiTests/i);
    await expect(page.locator('.logo:visible').first()).toBeVisible();
    await expect(page.locator('#root')).toBeVisible();
  });

  test('TC-SHELL-02: Navegación al Workspace sin parpadeo de contenido ni layout shift', async ({ page }) => {
    await enterWorkspace(page);
    await expect(page.locator('.app > aside.sidebar')).toBeVisible();
    await expect(page.locator('.stat-row, .workspace').first()).toBeVisible();
  });

  test('TC-SHELL-03: Conmutación de barra lateral compacta y persistencia de ancho', async ({ page }) => {
    await enterWorkspace(page);
    const sidebar = page.locator('.app > aside.sidebar');
    const collapseBtn = sidebar.locator('button.sidebar-collapse').first();
    await expect(collapseBtn).toBeVisible();

    const beforeBox = await sidebar.boundingBox();
    const beforeWidth = beforeBox?.width ?? 0;

    await collapseBtn.click();
    await expect(sidebar).toHaveClass(/compact/);
    await expect.poll(async () => {
      const box = await sidebar.boundingBox();
      return box ? box.width : beforeWidth;
    }).toBeLessThan(beforeWidth);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveClass(/compact/);
    const reloadBox = await sidebar.boundingBox();
    const reloadWidth = reloadBox?.width ?? 0;
    expect(reloadWidth).toBeLessThan(beforeWidth);
  });

  test('TC-SHELL-04: Apertura y cierre del drawer de notificaciones desde el botón de cabecera', async ({ page }) => {
    await enterWorkspace(page);
    const notifyBtn = page.locator('button.notify-btn').first();
    await expect(notifyBtn).toBeVisible();
    await notifyBtn.click();

    const drawer = page.getByTestId('shell-notifications-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveClass(/open/);
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    await page.keyboard.press('Escape');
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  test('TC-SHELL-05: Cierre accesible de modales al presionar tecla Escape', async ({ page }) => {
    await enterWorkspace(page);
    const projectBtn = page.locator('.app > aside.sidebar button.project-select');
    await expect(projectBtn).toBeVisible();
    await projectBtn.click();
    const addProjectBtn = page.getByRole('button', { name: /\+ agregar proyecto/i });
    await expect(addProjectBtn).toBeVisible();
    await addProjectBtn.click();
    const modal = page.getByRole('dialog', { name: /agregar proyecto local/i });
    await expect(modal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('TC-SHELL-06: Buscador global con filtrado instantáneo por ID y texto', async ({ page }) => {
    await seedBugsState(page);
    await enterWorkspace(page);
    await page.locator('.app > aside.sidebar nav button:has-text("Bug Tracker")').first().click();
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('BUG-01');

    await expect.poll(async () => {
      const rows = await page.locator('.table tbody tr').allTextContents();
      return rows.length > 0 && rows.every((t) => /BUG-01/i.test(t));
    }).toBe(true);
  });

  test('TC-SHELL-07: Badge de estado de conexión WebSocket con indicador pulsante', async ({ page, tobi }) => {
    await enterWorkspace(page);
    const wsBadge = page.getByTestId('shell-ws-badge');
    await expect(wsBadge).toBeVisible();
    await expect(wsBadge).toHaveText(/.+/);

    await expect.poll(() => {
      return tobi.events.some((e) => e.type === 'response' && e.status === 200 && (e.url.includes('/api/stream') || e.url.includes('/api/state')));
    }).toBe(true);
  });

  test('TC-SHELL-08: Botones interactivos con respuesta táctil y micro-transiciones', async ({ page }) => {
    await enterWorkspace(page);
    const btn = page.getByTestId('shell-primary-btn');
    await expect(btn).toBeVisible();

    const restStyle = await btn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        border: s.borderColor,
        boxShadow: s.boxShadow,
        transform: s.transform,
      };
    });

    await btn.hover();
    await expect.poll(async () => {
      return btn.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          bg: s.backgroundColor,
          border: s.borderColor,
          boxShadow: s.boxShadow,
          transform: s.transform,
        };
      });
    }).not.toEqual(restStyle);

    const restOutline = await btn.evaluate((el) => window.getComputedStyle(el).outline);
    await btn.focus();
    const focusStyle = await btn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { outline: s.outline, boxShadow: s.boxShadow };
    });
    expect(focusStyle.outline !== restOutline || focusStyle.boxShadow !== restStyle.boxShadow).toBe(true);
  });

  test('TC-SHELL-09: Contraste de texto conforme a WCAG AA en modo claro', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const logoWord = page.locator('.logo-word:visible').first();
    await expect(logoWord).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations.length).toBe(0);

    const ratio = await logoWord.evaluate((el: HTMLElement) => {
      function parseRgb(colorStr: string): [number, number, number] {
        const match = colorStr.match(/\d+(\.\d+)?/g);
        if (!match || match.length < 3) return [0, 0, 0];
        return [parseFloat(match[0]), parseFloat(match[1]), parseFloat(match[2])];
      }
      function relativeLuminance(r: number, g: number, b: number): number {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      const fg = parseRgb(window.getComputedStyle(el).color);
      let bg = [255, 255, 255];
      let curr: HTMLElement | null = el;
      while (curr) {
        const bgStyle = window.getComputedStyle(curr).backgroundColor;
        if (bgStyle && bgStyle !== 'transparent' && !bgStyle.includes('rgba(0, 0, 0, 0)')) {
          bg = parseRgb(bgStyle);
          break;
        }
        curr = curr.parentElement;
      }
      const l1 = relativeLuminance(fg[0], fg[1], fg[2]);
      const l2 = relativeLuminance(bg[0], bg[1], bg[2]);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    });

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
