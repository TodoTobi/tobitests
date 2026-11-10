import { test, expect } from '@playwright/test';

function createMockState(options: {
  auditScope: 'frontend' | 'backend' | 'fullstack';
  tests: any[];
  bugs?: any[];
}) {
  const failedCount = options.tests.filter((t: any) => t.status === 'Failed').length;
  const passedCount = options.tests.filter((t: any) => t.status === 'Passed').length;
  return {
    auditScope: options.auditScope,
    project: {
      name: 'TobiTests',
      repoPath: 'C:\\Users\\usuario\\Documents\\tobitests',
      url: 'http://localhost:5173',
      backendUrl: 'ws://localhost:9222',
      branch: 'main',
      environment: 'Universal Web Application',
      lastAudit: '10/11/2026 12:00',
      auditScope: options.auditScope,
    },
    metrics: {
      passRate: '80%',
      totalRuns: 1,
      failedTests: failedCount,
      openBugs: 0,
      avgDuration: '1.2s',
      activeRun: '#RUN-TEST-01',
      totalTests: options.tests.length,
    },
    journeyMap: { nodes: [], edges: [] },
    runs: [
      {
        id: '#RUN-TEST-01',
        suite: 'Run Detail Suite',
        branch: 'main',
        status: failedCount > 0 ? 'Failed' : 'Passed',
        total: options.tests.length,
        passed: passedCount,
        failed: failedCount,
        skipped: 0,
        duration: '1.5s',
        date: '10/11/2026',
        commit: 'abcdef1',
        tests: options.tests,
      },
    ],
    liveRun: {
      id: '#RUN-TEST-01',
      suite: 'Run Detail Suite',
      target: 'http://localhost:5173',
      status: 'Passed',
      currentStep: 3,
      totalSteps: 4,
      elapsedTime: '1.2s',
      steps: [],
      telemetryLogs: [],
    },
    officeAgents: [],
    bugs: options.bugs || [],
    specs: [],
    suites: [],
  };
}

test.describe('TobiTests — RunDetailPage & Front Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/stream*', (route) => route.abort());
    await page.route('**/api/antigravity/**', (route) => route.abort());
  });

  test('TC-RUNDETAIL-01: scope backend con fallos solo fuera de scope no deja tabla vacía y muestra scope-hidden-notice', async ({ page }) => {
    const mockState = createMockState({
      auditScope: 'backend',
      tests: [
        {
          name: 'GET /api/health',
          spec: 'api-health.spec.ts',
          status: 'Passed',
          duration: '45ms',
          steps: [],
        },
        {
          name: 'TC-SHELL-01: Header Render',
          spec: 'tobitests-shell.spec.ts',
          status: 'Failed',
          duration: '120ms',
          steps: [],
        },
      ],
    });

    await page.route('**/api/state*', (route) => route.fulfill({ json: mockState }));
    await page.route('**/data/*state.json', (route) => route.fulfill({ json: mockState }));
    await page.addInitScript((stateJson) => {
      window.localStorage.setItem('tobitests_current_view', 'run-detail');
      window.localStorage.setItem('tobitests_active_project', 'tobitests');
      window.localStorage.setItem('tobitests_state_tobitests', stateJson);
    }, JSON.stringify(mockState));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // La tabla de tests en scope no debe estar vacía
    const testItems = page.locator('.test-list-body .test-result');
    await expect(testItems).toHaveCount(1);
    await expect(testItems.first()).toContainText('GET /api/health');

    // Debe mostrarse el aviso de tests fuera del alcance
    const notice = page.getByTestId('scope-hidden-notice');
    await expect(notice).toBeVisible();
    await expect(notice).toHaveText(/fuera del alcance/i);
  });

  test('TC-RUNDETAIL-02: scope fullstack con fallo inicia en filtro Fallidos y muestra el test fallido', async ({ page }) => {
    const mockState = createMockState({
      auditScope: 'fullstack',
      tests: [
        {
          name: 'TC-FAIL-01: Broken Flow',
          spec: 'tobitests-failing.spec.ts',
          status: 'Failed',
          duration: '210ms',
          steps: [],
        },
        {
          name: 'TC-PASS-01: Working Flow',
          spec: 'tobitests-passing.spec.ts',
          status: 'Passed',
          duration: '80ms',
          steps: [],
        },
      ],
    });

    await page.route('**/api/state*', (route) => route.fulfill({ json: mockState }));
    await page.route('**/data/*state.json', (route) => route.fulfill({ json: mockState }));
    await page.addInitScript((stateJson) => {
      window.localStorage.setItem('tobitests_current_view', 'run-detail');
      window.localStorage.setItem('tobitests_active_project', 'tobitests');
      window.localStorage.setItem('tobitests_state_tobitests', stateJson);
    }, JSON.stringify(mockState));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // El filtro activo inicial debe ser "Fallidos"
    const activeTab = page.locator('.panel-head .tab.active');
    await expect(activeTab).toContainText('Fallidos');

    // Se muestra el test fallido
    const testItems = page.locator('.test-list-body .test-result');
    await expect(testItems).toHaveCount(1);
    await expect(testItems.first()).toContainText('TC-FAIL-01');
  });

  test('TC-RUNDETAIL-03: modal en test con stepsMissing y steps vacíos muestra steps-empty', async ({ page }) => {
    const mockState = createMockState({
      auditScope: 'fullstack',
      tests: [
        {
          name: 'TC-EMPTY-01: No Steps Test',
          spec: 'tobitests-smoke.spec.ts',
          status: 'Passed',
          duration: '90ms',
          steps: [],
          stepsMissing: true,
        },
      ],
    });

    await page.route('**/api/state*', (route) => route.fulfill({ json: mockState }));
    await page.route('**/data/*state.json', (route) => route.fulfill({ json: mockState }));
    await page.addInitScript((stateJson) => {
      window.localStorage.setItem('tobitests_current_view', 'run-detail');
      window.localStorage.setItem('tobitests_active_project', 'tobitests');
      window.localStorage.setItem('tobitests_state_tobitests', stateJson);
    }, JSON.stringify(mockState));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Clic en el test para abrir TestDetailModal
    const testItem = page.locator('.test-list-body .test-result', { hasText: 'TC-EMPTY-01' });
    await expect(testItem).toBeVisible();
    await testItem.click();

    const emptyBox = page.getByTestId('steps-empty');
    await expect(emptyBox).toBeVisible();
    await expect(emptyBox).toHaveText(/sin pasos registrados/i);
  });

  test('TC-RUNDETAIL-04: modal con console_log y network_trace vacíos pero con stats muestra telemetry-empty', async ({ page }) => {
    const mockState = createMockState({
      auditScope: 'backend',
      tests: [
        {
          name: 'TC-TEL-01: Clean Telemetry',
          spec: 'api-clean.spec.ts',
          status: 'Passed',
          duration: '110ms',
          steps: [
            {
              step: 1,
              action: 'Assert',
              target: 'expect(res.status).toBe(200)',
              status: 'Passed',
              duration: '15ms',
            },
          ],
          evidence: {
            console_log: [],
            network_trace: [],
            console_stats: { total: 0, by_level: {} },
            network_stats: { total: 12, by_status_group: { '2xx': 12 }, failed_count: 0 },
          },
        },
      ],
    });

    await page.route('**/api/state*', (route) => route.fulfill({ json: mockState }));
    await page.route('**/data/*state.json', (route) => route.fulfill({ json: mockState }));
    await page.addInitScript((stateJson) => {
      window.localStorage.setItem('tobitests_current_view', 'run-detail');
      window.localStorage.setItem('tobitests_active_project', 'tobitests');
      window.localStorage.setItem('tobitests_state_tobitests', stateJson);
    }, JSON.stringify(mockState));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Abrir modal haciendo clic en el test
    const testItem = page.locator('.test-list-body .test-result', { hasText: 'TC-TEL-01' });
    await expect(testItem).toBeVisible();
    await testItem.click();

    // Asegurarse de activar vista de telemetría si está en otro modo
    const httpBtn = page.locator('.media-mode-toggle button:has-text("HTTP")');
    if (await httpBtn.count() > 0) {
      await httpBtn.first().click();
    }

    const emptyTelemetry = page.getByTestId('telemetry-empty');
    await expect(emptyTelemetry).toBeVisible();
    await expect(emptyTelemetry).toHaveText(/sin errores/i);
    await expect(emptyTelemetry).toContainText('12');
  });

  test('TC-RUNDETAIL-05: modal con steps con propiedad t renderiza +{t}ms en la fila', async ({ page }) => {
    const mockState = createMockState({
      auditScope: 'fullstack',
      tests: [
        {
          name: 'TC-TIMED-01: Timed Steps Test',
          spec: 'tobitests-smoke.spec.ts',
          status: 'Passed',
          duration: '1800ms',
          steps: [
            {
              step: 1,
              action: 'Navigate',
              target: 'page.goto(/)',
              status: 'Passed',
              duration: '180ms',
              t: 1500,
            },
          ],
        },
      ],
    });

    await page.route('**/api/state*', (route) => route.fulfill({ json: mockState }));
    await page.route('**/data/*state.json', (route) => route.fulfill({ json: mockState }));
    await page.addInitScript((stateJson) => {
      window.localStorage.setItem('tobitests_current_view', 'run-detail');
      window.localStorage.setItem('tobitests_active_project', 'tobitests');
      window.localStorage.setItem('tobitests_state_tobitests', stateJson);
    }, JSON.stringify(mockState));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Abrir modal
    const testItem = page.locator('.test-list-body .test-result', { hasText: 'TC-TIMED-01' });
    await expect(testItem).toBeVisible();
    await testItem.click();

    // Verificar que se renderiza +1500ms en el timeline
    const timeline = page.locator('.steps-timeline');
    await expect(timeline).toContainText('+1500ms');
  });

  test('TC-RUNDETAIL-06: con el estado mockeado SIN liveRun, el header NO contiene #RUN-LIVE y contiene —', async ({ page }) => {
    const mockState = createMockState({
      auditScope: 'fullstack',
      tests: [
        {
          name: 'TC-SIMPLE-01',
          spec: 'simple.spec.ts',
          status: 'Passed',
          duration: '50ms',
          steps: [],
        },
      ],
    });
    delete (mockState as any).liveRun;

    await page.route('**/api/state*', (route) => route.fulfill({ json: mockState }));
    await page.route('**/data/*state.json', (route) => route.fulfill({ json: mockState }));
    await page.addInitScript((stateJson) => {
      window.localStorage.setItem('tobitests_current_view', 'run-detail');
      window.localStorage.setItem('tobitests_active_project', 'tobitests');
      window.localStorage.setItem('tobitests_state_tobitests', stateJson);
    }, JSON.stringify(mockState));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const runChip = page.locator('.run-chip');
    await expect(runChip).toBeVisible();
    await expect(runChip).not.toContainText('#RUN-LIVE');
    await expect(runChip).toContainText('—');
  });
});
