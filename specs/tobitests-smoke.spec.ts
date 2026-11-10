import { test, expect } from './fixtures/tobi';

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
    const officeBtn = page.getByRole('button', { name: /la oficina/i }).first();
    await expect(officeBtn).toBeVisible();
    await officeBtn.click();
    await expect(page.locator('.iso-studio, .office-viewport, .office-layout').first()).toBeVisible();
  });

  test('TC-SMOKE-05: Scope Switcher API synchronizes auditScope without 500 error', async ({ request }) => {
    const liveRes = await request.get('/api/antigravity/live');
    const liveData = await liveRes.json();
    const originalScope = liveData.auditScope || 'fullstack';
    try {
      const res = await request.post('/api/antigravity/scope', {
        data: { project: 'tobitests', auditScope: 'frontend' },
      });
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.auditScope).toBe('frontend');
    } finally {
      await request.post('/api/antigravity/scope', {
        data: { project: 'tobitests', auditScope: originalScope },
      });
    }
  });

  test('TC-SMOKE-06: Orchestration Engine API synchronizes BYOA config', async ({ request }) => {
    const liveRes = await request.get('/api/antigravity/live');
    const liveData = await liveRes.json();
    const originalConfig = liveData.orchestrationConfig || {
      mode: 'dual',
      primaryAgent: 'antigravity',
      secondaryAgent: 'opencode',
    };
    try {
      const res = await request.post('/api/antigravity/orchestration', {
        data: { mode: 'dual', primaryAgent: 'claude-code', secondaryAgent: 'opencode' },
      });
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.orchestrationConfig.primaryAgent).toBe('claude-code');
    } finally {
      await request.post('/api/antigravity/orchestration', {
        data: originalConfig,
      });
    }
  });
});
