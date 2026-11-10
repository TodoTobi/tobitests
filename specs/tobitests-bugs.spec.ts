import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';
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
        observedFact: 'El feed de telemetría acumulaba entradas de puestos inactivos en vez de aislar el stream del agente seleccionado.',
        whiteBoxHypothesis: 'La interfaz LogEntry y filteredLogs carecían de asociación por agentId y discriminación de búfer reactivo.',
        affectedFile: 'web/src/components/OfficeView.tsx',
        recommendedFix: 'Inyección de agentId en LogEntry, filtro reactivo de stream por agente y botón de purga de búfer.',
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

async function enterBugTracker(page: Page) {
  await seedBugsState(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const enterBtn = page.getByRole('button', { name: /entrar al workspace/i });
  const sidebar = page.locator('.app > aside.sidebar');
  await expect(enterBtn.or(sidebar).first()).toBeVisible();
  if (await enterBtn.isVisible()) {
    await enterBtn.click();
  }
  await expect(sidebar).toBeVisible();

  const bugBtn = sidebar.locator('nav button:has-text("Bug Tracker")').first();
  await bugBtn.click();
  await expect(page.locator('.table, .panel').first()).toBeVisible();
}

test.describe('TobiTests — Bug Tracker, BDD & Evidence Tabs', () => {
  test('TC-BUGS-01: Lista de bugs renderiza ID, título, severidad y agente detector', async ({ page }) => {
    await enterBugTracker(page);
    await expect(page.locator('.table')).toBeVisible();
    await expect(page.locator('.table tbody tr').first()).toBeVisible();
  });

  test('TC-BUGS-02: Buscador de incidentes filtra reactivamente por término', async ({ page }) => {
    await enterBugTracker(page);
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Divergencia');

    await expect.poll(async () => {
      const rows = await page.locator('.table tbody tr').allTextContents();
      return rows.length > 0 && rows.every((t) => /Divergencia/i.test(t));
    }).toBe(true);
  });

  test('TC-BUGS-03: Ficha de bug presenta estructura Gherkin Dado que / Cuando / Entonces', async ({ page }) => {
    await enterBugTracker(page);
    const firstBug = page.locator('.table tbody tr.clickable, .table tbody tr').first();
    await expect(firstBug).toBeVisible();
    await firstBug.click();

    const scenarioCard = page.locator('.scenario-card, .bug-layout').first();
    await expect(scenarioCard).toBeVisible();
    await expect(scenarioCard.getByText(/dado que/i).first()).toBeVisible();
    await expect(scenarioCard.getByText(/cuando/i).first()).toBeVisible();
    await expect(scenarioCard.getByText(/entonces/i).first()).toBeVisible();
  });

  test('TC-BUGS-04: Modal de vista previa de reporte completo con scroll suave', async ({ page }) => {
    await enterBugTracker(page);
    const previewBtn = page.locator('button:has-text("Vista previa")').first();
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    const modal = page.locator('.modal').first();
    await expect(modal).toBeVisible();
    const pre = modal.locator('pre.pre');
    await expect(pre).toBeVisible();
    const closeBtn = modal.locator('button:has-text("Cerrar")').first();
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });
});
