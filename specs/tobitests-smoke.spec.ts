import { test, expect } from '@playwright/test';

test.describe('TobiTests — Platform Smoke & Self-Audit Suite', () => {
  test('TC-SMOKE-01: Dashboard loads entry point and renders application container', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TobiTests/i);
    await expect(page.locator('#root')).toBeVisible();
  });

  test('TC-SMOKE-02: Blackboard API endpoint returns 200 OK and valid JSON schema', async ({ request }) => {
    const res = await request.get('/api/antigravity/live');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('blackboardState');
    expect(json).toHaveProperty('activeOrchestrator');
  });

  test('TC-SMOKE-03: Shared State API returns 200 and project metadata', async ({ request }) => {
    const res = await request.get('/api/state');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('project');
    expect(json.project).toHaveProperty('name');
  });

  test('TC-SMOKE-04: Navigation switches between Journey Canvas and La Oficina', async ({ page }) => {
    await page.goto('/');
    const officeBtn = page.locator('button:has-text("La Oficina")').first();
    if (await officeBtn.isVisible()) {
      await officeBtn.click();
      await expect(page.locator('.iso-studio')).toBeVisible();
    }
  });

  test('TC-SMOKE-05: Scope Switcher API synchronizes auditScope without 500 error', async ({ request }) => {
    const res = await request.post('/api/antigravity/scope', {
      data: { project: 'tobitests', auditScope: 'fullstack' },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.auditScope).toBe('fullstack');
  });

  test('TC-SMOKE-06: Orchestration Engine API synchronizes BYOA config', async ({ request }) => {
    const res = await request.post('/api/antigravity/orchestration', {
      data: { mode: 'dual', primaryAgent: 'antigravity', secondaryAgent: 'opencode' },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.orchestrationConfig.primaryAgent).toBe('antigravity');
  });
});
