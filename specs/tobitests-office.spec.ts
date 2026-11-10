import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/tobi';

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

async function enterOffice(page: Page) {
  await enterWorkspace(page);
  const officeBtn = page.locator('.app > aside.sidebar nav button:has-text("La Oficina")');
  await expect(officeBtn).toBeVisible();
  await officeBtn.click();
  await expect(page.locator('.iso-layout, .iso-stage, canvas').first()).toBeVisible();
}

test.describe('TobiTests — Virtual Office & Isometric Simulation', () => {
  test('TC-OFFICE-01: Renderizado de la cuadrícula isométrica en canvas 2.5D', async ({ page }) => {
    await enterOffice(page);
    await expect(page.locator('.iso-layout, .iso-stage, canvas').first()).toBeVisible();
  });

  test('TC-OFFICE-02: Estación Mesa de Comando Central con agente Orchestrator activo', async ({ page }) => {
    await enterOffice(page);
    const orchestratorAgent = page.getByTestId('office-agent-orchestrator');
    await expect(orchestratorAgent).toBeVisible();
    const stateAttr = await orchestratorAgent.getAttribute('data-state');
    expect(['working', 'idle']).toContain(stateAttr);

    const stateRes = await page.request.get('/api/state?project=tobitests');
    const stateJson = await stateRes.json();
    const expectedAgents = stateJson.officeAgents || [];
    const renderedAgents = page.locator('[data-testid^="office-agent-"]');
    await expect(renderedAgents).toHaveCount(expectedAgents.length);
  });

  test('TC-OFFICE-03: Feed de telemetría en tiempo real con niveles info, warn y success', async ({ page }) => {
    await enterOffice(page);
    const feed = page.getByTestId('office-feed');
    await expect(feed).toBeVisible();
    const items = feed.locator('[data-testid="office-feed-item"]');
    await expect.poll(async () => await items.count()).toBeGreaterThanOrEqual(1);

    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const level = await items.nth(i).getAttribute('data-level');
      expect(['info', 'warn', 'success', 'error']).toContain(level);
    }
  });

  test('TC-OFFICE-04: Conmutación entre estado working e idle con actualización de avatar', async ({ page }) => {
    await enterOffice(page);
    const toggleBtn = page.locator('.iso-inspector').getByRole('button', { name: /(mandar a descansar|poner a laburar)/i });
    await expect(toggleBtn).toBeVisible();
    const beforeText = (await toggleBtn.textContent()) || '';
    await toggleBtn.click();
    await expect.poll(async () => {
      const afterText = (await toggleBtn.textContent()) || '';
      return afterText !== beforeText;
    }).toBe(true);

    // Restaurar estado inicial
    await toggleBtn.click();
    await expect.poll(async () => {
      const restoredText = (await toggleBtn.textContent()) || '';
      return restoredText === beforeText;
    }).toBe(true);
  });

  test('TC-OFFICE-13: Divergencia de estado en filtros de telemetría al alternar agentes (BUG-01)', async ({ page }) => {
    await enterOffice(page);
    const filterAllBtn = page.getByTestId('office-filter-all');
    await expect(filterAllBtn).toBeVisible();

    const getCounter = async () => {
      const text = (await filterAllBtn.textContent()) || '';
      const match = text.match(/\((\d+)\)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const countBefore = await getCounter();
    const itemsBefore = await page.getByTestId('office-feed-item').count();
    expect(itemsBefore).toBe(countBefore);

    const explorer = page.getByTestId('office-agent-explorer');
    if (await explorer.isVisible()) {
      await explorer.click();
    }

    const countAfter = await getCounter();
    const itemsAfter = await page.getByTestId('office-feed-item').count();
    expect(itemsAfter).toBe(countAfter);
  });
});
