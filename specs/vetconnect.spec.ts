import { test, expect, type Page } from './fixtures/tobi';

const TARGET_URL = (process.env.TARGET_URL || 'http://localhost:5173').replace('[::1]', 'localhost');
const API_URL = process.env.API_URL || 'http://localhost:3001';

async function dismissCookieBanner(page: Page): Promise<void> {
  const cookieBtn = page
    .locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar"), button:has-text("Accept")')
    .first();
  if (await cookieBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await cookieBtn.click().catch(() => {});
  }
}

async function loginAs(
  page: Page,
  tobi: { humanClick: Function; humanType: Function; touch: Function },
  email: string,
  password: string,
  expectedUrlPattern: RegExp
): Promise<void> {
  await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  tobi.touch('login');
  await dismissCookieBanner(page);

  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passInput = page.locator('input[name="password"], input[type="password"]').first();
  const submitBtn = page.locator('button.auth-submit, button[type="submit"], button:has-text("Ingresar")').first();

  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await tobi.humanType(emailInput, email, { delayPerChar: 18 });
  await tobi.humanType(passInput, password, { delayPerChar: 18 });
  await tobi.humanClick(submitBtn);

  const continueBtn = page.locator('button.auth-submit:has-text("Continuar"), button:has-text("Continuar")').first();
  await Promise.race([
    page.waitForURL(expectedUrlPattern, { timeout: 15000 }),
    continueBtn.waitFor({ state: 'visible', timeout: 15000 }).then(async () => {
      if (!expectedUrlPattern.test(page.url()) && (await continueBtn.isVisible().catch(() => false))) {
        await tobi.humanClick(continueBtn).catch(() => {});
      }
    }),
  ]);

  await page.waitForURL(expectedUrlPattern, { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
}

test.describe('Huellicam (VetConnect) — Fullstack E2E & 3-Oracle QA Suite', () => {
  test('TC-01: Landing & Entry Point Readiness (Layer 1 Oracle)', async ({ page, tobi }) => {
    await tobi.step('Navigate to Huellicam landing page', async () => {
      tobi.touch('landing');
      const res = await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 15000 });
      expect(res ? res.status() : 200).toBeLessThan(400);
      await dismissCookieBanner(page);
    });

    await tobi.step('Verify title, hero copy and primary CTAs', async () => {
      await expect(page).toHaveTitle(/Huellicam/i);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(80);
      const cta = page.locator('a[href="/login"], a[href="/register"], button:has-text("Comenzar")').first();
      await expect(cta).toBeVisible({ timeout: 8000 });
      await tobi.snap('landing-hero');
    });
  });

  test('TC-02: Auth Form Validation & Error Feedback (Layer 2 Oracle)', async ({ page, tobi }) => {
    await tobi.step('Open /login and submit malformed credentials', async () => {
      tobi.touch('login');
      await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await dismissCookieBanner(page);

      const emailInput = page.locator('input[name="email"], input[type="email"]').first();
      const submitBtn = page.locator('button.auth-submit, button[type="submit"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      await tobi.humanType(emailInput, 'correo-invalido', { delayPerChar: 15 });
      await tobi.humanClick(submitBtn);
    });

    await tobi.step('Assert inline validation errors render cleanly', async () => {
      const errorCount = await page.locator('.auth-field--error, [aria-invalid="true"]').count();
      expect(errorCount).toBeGreaterThan(0);
      await tobi.snap('login-validation-error');
    });
  });

  test('TC-03: Tutor Journey — Dashboard, Pets Dossier & Consultations (Layer 2 Oracle)', async ({ page, tobi }) => {
    await tobi.step('Authenticate as Tutor (client1@huellicam.com)', async () => {
      await loginAs(page, tobi, 'client1@huellicam.com', 'Password123!', /\/client/);
      tobi.touch('client');
      await expect(page.locator('main, .c-shell, aside').first()).toBeVisible({ timeout: 10000 });
      await tobi.snap('tutor-dashboard');
    });

    await tobi.step('Navigate to Mis mascotas and verify seeded pet Rex', async () => {
      const petsNav = page.locator('a[href="/client/pets"], button:has-text("Mis mascotas")').first();
      if (await petsNav.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tobi.humanClick(petsNav);
      } else {
        await page.goto(`${TARGET_URL}/client/pets`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      }
      await page.waitForURL(/\/client\/pets/, { timeout: 10000 });
      await expect(page.locator('body')).toContainText(/Rex/i, { timeout: 10000 });
      await tobi.snap('tutor-pets');
    });

    await tobi.step('Navigate to Mis consultas & Recetas', async () => {
      await page.goto(`${TARGET_URL}/client/consultations`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await expect(page.locator('main, body').first()).toBeVisible();
      await page.goto(`${TARGET_URL}/client/prescriptions`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await expect(page.locator('main, body').first()).toBeVisible();
      await tobi.snap('tutor-prescriptions');
    });
  });

  test('TC-04: Veterinarian Journey — Dashboard, Queue & Patients (Layer 2 Oracle)', async ({ page, tobi }) => {
    await tobi.step('Authenticate as Approved Vet (vet.approved@huellicam.com)', async () => {
      await loginAs(page, tobi, 'vet.approved@huellicam.com', 'Password123!', /\/vet/);
      await expect(page.locator('.v-topbar, .v-shell, aside, main').first()).toBeVisible({ timeout: 10000 });
      await tobi.snap('vet-dashboard');
    });

    await tobi.step('Navigate to Cola de atención & Pacientes', async () => {
      const queueLink = page.locator('button:has-text("Cola de atención"), a[href*="/vet/queue"]').first();
      if (await queueLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tobi.humanClick(queueLink);
      } else {
        await page.goto(`${TARGET_URL}/vet/queue`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      }
      await page.waitForURL(/\/vet\/queue/, { timeout: 10000 });
      await tobi.snap('vet-queue');

      await page.goto(`${TARGET_URL}/vet/patients`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await expect(page.locator('main, .v-shell').first()).toBeVisible({ timeout: 10000 });
      await tobi.snap('vet-patients');
    });
  });

  test('TC-05: Admin Journey — Executive Dashboard & Vet Moderation (Layer 2 Oracle)', async ({ page, tobi }) => {
    await tobi.step('Authenticate as Admin (admin@huellicam.com)', async () => {
      await loginAs(page, tobi, 'admin@huellicam.com', 'Password123!', /\/admin/);
      await expect(page.locator('main, aside, body').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('body')).toContainText(/Veterinarios|Consultas|Panel|Admin/i, { timeout: 10000 });
      await tobi.snap('admin-dashboard');
    });
  });

  test('TC-06: RBAC Enforcement & Route Guards (Layer 2 Oracle)', async ({ page, context, tobi }) => {
    await tobi.step('Verify unauthenticated access redirects to /login', async () => {
      await context.clearCookies();
      for (const protectedRoute of ['/client/dashboard', '/vet/dashboard', '/admin/dashboard']) {
        await page.goto(`${TARGET_URL}${protectedRoute}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForURL(/\/login/, { timeout: 10000 });
        expect(page.url()).toContain('/login');
      }
    });

    await tobi.step('Verify Tutor cannot access /admin/dashboard', async () => {
      await loginAs(page, tobi, 'client1@huellicam.com', 'Password123!', /\/client/);
      await page.goto(`${TARGET_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForURL(/\/client|\/login/, { timeout: 10000 });
      expect(page.url()).not.toContain('/admin/dashboard');
      await tobi.snap('rbac-tutor-blocked-from-admin');
    });
  });

  test('TC-07: Public Onboarding, Password Recovery & SENASA Portal (Layer 1 & 2 Oracle)', async ({ page, tobi }) => {
    await tobi.step('Check /register role selection', async () => {
      tobi.touch('register');
      await page.goto(`${TARGET_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await dismissCookieBanner(page);
      await expect(page.locator('main, form, .auth-shell').first()).toBeVisible({ timeout: 10000 });
      await tobi.snap('register-page');
    });

    await tobi.step('Check /forgot-password flow', async () => {
      tobi.touch('forgot-password');
      await page.goto(`${TARGET_URL}/forgot-password`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
      await tobi.snap('forgot-password');
    });

    await tobi.step('Check /verify-rx SENASA verification fallback', async () => {
      await page.goto(`${TARGET_URL}/verify-rx`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await expect(page.locator('[data-testid="prescription-error"], main').first()).toBeVisible({ timeout: 10000 });
      await tobi.snap('verify-rx');
    });
  });

  test('TC-08: Mobile Viewport (375x812) & Visual Layout Integrity (Layer 3 Oracle)', async ({ page, tobi }) => {
    await tobi.step('Check Landing horizontal overflow on mobile 375x812', async () => {
      tobi.touch('landing');
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 15000 });
      await dismissCookieBanner(page);
      const landingOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 25
      );
      expect(landingOverflow).toBe(false);
      await tobi.snap('mobile-landing');
    });

    await tobi.step('Check Login horizontal overflow on mobile 375x812', async () => {
      tobi.touch('login');
      await page.goto(`${TARGET_URL}/login`, { waitUntil: 'load', timeout: 15000 });
      const loginOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 25
      );
      expect(loginOverflow).toBe(false);
      await tobi.snap('mobile-login');
    });
  });

  test('TC-09: Backend API Contracts, Auth & Security SLA (Layer 1 & 2 API Oracle)', async ({ request, tobi }) => {
    await tobi.step('GET /health returns 200 OK with database connected under 2500ms', async () => {
      tobi.touch('api-get-health');
      const start = Date.now();
      const res = await request.get(`${API_URL}/health`);
      const elapsed = Date.now() - start;
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.database).toBe('connected');
      expect(elapsed).toBeLessThan(2500);
    });

    await tobi.step('Unauthenticated admin endpoints reject deterministically with 401', async () => {
      tobi.touch('api-get-stats');
      tobi.touch('api-get-vets-pending');
      const statsRes = await request.get(`${API_URL}/api/admin/stats`);
      expect([401, 403]).toContain(statsRes.status());

      const pendingRes = await request.get(`${API_URL}/api/admin/vets/pending`);
      expect([401, 403]).toContain(pendingRes.status());
    });

    await tobi.step('POST /api/auth/login rejects malformed payload without 500', async () => {
      const badRes = await request.post(`${API_URL}/api/auth/login`, {
        data: { email: 'not-an-email' },
      });
      expect(badRes.status()).toBeLessThan(500);
      expect([400, 401, 422]).toContain(badRes.status());
    });

    await tobi.step('Authenticated Tutor login + GET /api/pets matches seeded pet Rex', async () => {
      const loginRes = await request.post(`${API_URL}/api/auth/login`, {
        data: { email: 'client1@huellicam.com', password: 'Password123!' },
      });
      expect(loginRes.status()).toBe(200);
      const loginBody = await loginRes.json();
      const token = loginBody?.data?.accessToken || loginBody?.accessToken;
      expect(typeof token).toBe('string');

      const petsRes = await request.get(`${API_URL}/api/pets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(petsRes.status()).toBe(200);
      const petsBody = await petsRes.json();
      const petsList = Array.isArray(petsBody?.data) ? petsBody.data : [];
      expect(petsList.some((p: { name?: string }) => /Rex/i.test(p.name || ''))).toBe(true);
    });
  });
});
