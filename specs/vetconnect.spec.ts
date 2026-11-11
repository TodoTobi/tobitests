import { test, expect } from '@playwright/test';

const TARGET_URL = (process.env.TARGET_URL || 'http://localhost:5173').replace('[::1]', 'localhost');

test.describe('VetConnect — Plataforma de Telemedicina Veterinaria (E2E & 3-Layer Oracles)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error] ${msg.text()}`);
      }
    });
  });

  test('TC-01: Entry Point & DOM Readiness (Layer 1 Oracle)', async ({ page }) => {
    const res = await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    expect(res ? res.status() : 200).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/tc-01-entry-point.png' });
  });

  test('TC-02: Runtime Telemetry & Console Health (Layer 1 Oracle)', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const server5xxErrors: string[] = [];

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('chrome-extension')) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 500) {
        server5xxErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 15000 });
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/tc-02-runtime-telemetry.png' });

    // 1. Unhandled runtime exceptions
    const fatalErrors = pageErrors.filter((e) => !e.includes('chrome-extension'));
    expect(fatalErrors).toEqual([]);

    // 2. HTTP 5xx Server Errors (Layer 1 Oracle enforcement)
    expect(server5xxErrors, 'Layer 1 Oracle violation: Server 5xx responses detected').toEqual([]);

    // 3. Blocked critical console patterns
    const blockedPatternMatches = consoleErrors.filter((msg) =>
      /Failed to load resource.*status of 5\d\d/i.test(msg) || /ECONNREFUSED/i.test(msg)
    );
    expect(blockedPatternMatches, 'Layer 1 Oracle violation: Critical 5xx/ECONNREFUSED errors in console').toEqual([]);
  });

  test('TC-03: Doctor Authentication & Portal Access (Layer 2 Oracle)', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const cookieBtn = page.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieBtn.click();
    }

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passInput = page.locator('input[name="password"], input[type="password"]').first();
    const submitBtn = page.locator('button.auth-submit, button[type="submit"], button:has-text("Ingresar")').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill('doctor@gmail.com');
    await passInput.fill('Password123!');

    await submitBtn.click();

    // Handle optional SuccessState screen or direct navigation
    const continueBtn = page.locator('button:has-text("Continuar")');
    if (await continueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await continueBtn.click();
    }

    // Verify successful authentication and redirection to Doctor Portal
    await page.waitForURL(/.*(\/vet\/dashboard|\/client|\/dashboard)/, { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.v-topbar, aside.sidebar, .v-shell, main', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/tc-03-doctor-dashboard.png' });
  });

  test('TC-04: Tutor Authentication & Pet Dossier (Layer 2 Oracle)', async ({ page, context }) => {
    // Clear cookies/storage to ensure clean Tutor session
    await context.clearCookies();
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const cookieBtn = page.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieBtn.click();
    }

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passInput = page.locator('input[name="password"], input[type="password"]').first();
    const submitBtn = page.locator('button.auth-submit, button[type="submit"], button:has-text("Ingresar")').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill('tobias@gmail.com');
    await passInput.fill('Password123!');

    await submitBtn.click();

    // Handle optional SuccessState screen or direct navigation
    const continueBtn = page.locator('button:has-text("Continuar")');
    if (await continueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await continueBtn.click();
    }

    // Verify redirection to Client / Tutor workspace
    await page.waitForURL(/.*(\/client\/dashboard|\/client|\/dashboard)/, { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.c-shell, .app-shell, aside.sidebar, main', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/tc-04-tutor-dashboard.png' });
  });

  test('TC-05: Protected Route Redirection & RBAC Enforcement (Layer 2 Oracle)', async ({ page, context }) => {
    // Attempt to access protected client route without session
    await context.clearCookies();
    await page.goto(`${TARGET_URL}/client/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Unauthenticated user must be redirected to /login
    await page.waitForURL(/.*login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: 'test-results/tc-05-rbac-redirect.png' });
  });

  test('TC-06: Interactive Surface & Form Validation (Layer 2 Oracle)', async ({ page }) => {
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passInput = page.locator('input[name="password"], input[type="password"]').first();
    const submitBtn = page.locator('button.auth-submit, button[type="submit"]').first();

    // Submit with invalid email format
    await emailInput.fill('invalid-email-format');
    await passInput.fill('');
    await submitBtn.click();

    // Error feedback should be rendered
    const hasFieldFeedback = await page.locator('.auth-field--error, [aria-invalid="true"]').count();
    expect(hasFieldFeedback).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/tc-06-form-validation.png' });
  });

  test('TC-07: Viewport Adaptability & Layout Integrity (Layer 3 Oracle)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const hasSevereOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 25;
    });
    expect(hasSevereOverflow).toBe(false);
    await page.screenshot({ path: 'test-results/tc-07-viewport-mobile.png' });
  });

  test('TC-08: Backend Health & REST SLA Contract (< 2500ms SLA)', async ({ request }) => {
    const start = Date.now();
    const res = await request.get('http://localhost:3001/health');
    const elapsed = Date.now() - start;
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
    expect(elapsed).toBeLessThan(2500);
  });

  test('TC-09: Dual-Party Video Call & Real-time Consultation (Doctor <-> Tutor)', async ({ browser }) => {
    // Context 1: Doctor (doctor@gmail.com)
    const docContext = await browser.newContext({
      permissions: ['camera', 'microphone'],
      viewport: { width: 1280, height: 720 },
    });
    const docPage = await docContext.newPage();

    // Context 2: Tutor (tobias@gmail.com)
    const tutorContext = await browser.newContext({
      permissions: ['camera', 'microphone'],
      viewport: { width: 1280, height: 720 },
    });
    const tutorPage = await tutorContext.newPage();

    try {
      // 1. Authenticate Doctor
      await docPage.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const cookie1 = docPage.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
      if (await cookie1.isVisible({ timeout: 2000 }).catch(() => false)) await cookie1.click();
      await docPage.locator('input[name="email"], input[type="email"]').first().fill('doctor@gmail.com');
      await docPage.locator('input[name="password"], input[type="password"]').first().fill('Password123!');
      await docPage.locator('button.auth-submit, button[type="submit"], button:has-text("Ingresar")').first().click();
      await docPage.locator('button:has-text("Continuar")').click({ timeout: 8000 }).catch(() => {});
      await docPage.waitForURL(/.*(\/vet\/dashboard|\/client|\/dashboard)/, { timeout: 15000, waitUntil: 'domcontentloaded' });

      // 2. Authenticate Tutor
      await tutorPage.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const cookie2 = tutorPage.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
      if (await cookie2.isVisible({ timeout: 2000 }).catch(() => false)) await cookie2.click();
      await tutorPage.locator('input[name="email"], input[type="email"]').first().fill('tobias@gmail.com');
      await tutorPage.locator('input[name="password"], input[type="password"]').first().fill('Password123!');
      await tutorPage.locator('button.auth-submit, button[type="submit"], button:has-text("Ingresar")').first().click();
      await tutorPage.locator('button:has-text("Continuar")').click({ timeout: 8000 }).catch(() => {});
      await tutorPage.waitForURL(/.*(\/client\/dashboard|\/client|\/dashboard)/, { timeout: 15000, waitUntil: 'domcontentloaded' });

      // 3. Connect both participants to the active consultation room
      const activeCallId = 'fcc3078f-f889-443b-8b42-73eb915455bb';
      await Promise.all([
        docPage.goto(`${TARGET_URL}/call/${activeCallId}`, { waitUntil: 'domcontentloaded', timeout: 15000 }),
        tutorPage.goto(`${TARGET_URL}/call/${activeCallId}`, { waitUntil: 'domcontentloaded', timeout: 15000 }),
      ]);

      await docPage.waitForTimeout(3000);

      // 4. Verify Call Shell & Telemetry Header
      const headerText = await docPage.locator('header.v-call__head, .v-call__tag').first().innerText();
      expect(headerText.length).toBeGreaterThan(0);

      // Verify SENASA / Legal regulatory compliance badge
      const complianceBadge = docPage.locator('text=SENASA Res. 1442/2021');
      await expect(complianceBadge).toBeVisible({ timeout: 5000 });

      // 5. Test Call Interactive Controls (Doctor)
      const muteBtn = docPage.locator('button.v-ctl:has-text("Silenciar")');
      await expect(muteBtn).toBeVisible({ timeout: 5000 });
      await muteBtn.click();
      await expect(docPage.locator('button.v-ctl:has-text("Activar mic")')).toBeVisible({ timeout: 3000 });
      await docPage.locator('button.v-ctl:has-text("Activar mic")').click();

      // Test Panels: Chat
      const chatBtn = docPage.locator('button.v-ctl:has-text("Chat")');
      await chatBtn.click();
      await expect(docPage.locator('.v-call__panel.is-open')).toBeVisible({ timeout: 3000 });

      // Test Panels: Ficha clínica
      const fichaBtn = docPage.locator('button.v-ctl:has-text("Ficha")');
      await fichaBtn.click();
      await expect(docPage.locator('.v-call__panel:has-text("Ficha clínica")')).toBeVisible({ timeout: 3000 });

      // Test Panels: Evolución (Doctor only)
      const evoBtn = docPage.locator('button.v-ctl:has-text("Evolución")');
      await evoBtn.click();
      await expect(docPage.locator('.v-call__panel:has-text("Evolución clínica")')).toBeVisible({ timeout: 3000 });

      // 6. RBAC Verification (Tutor must NOT have Evolución access)
      const tutorEvoBtn = tutorPage.locator('button.v-ctl:has-text("Evolución")');
      const hasTutorEvo = await tutorEvoBtn.count();
      expect(hasTutorEvo).toBe(0);

      // 7. Capture visual proof of the connected call
      await docPage.screenshot({ path: 'test-results/tc-09-call-doctor-console.png' });
      await tutorPage.screenshot({ path: 'test-results/tc-09-call-tutor-console.png' });
    } finally {
      await docContext.close();
      await tutorContext.close();
    }
  });

  test('TC-10: Doctor Clinical Queue & Triage Desk (Layer 2 Oracle)', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const cookieBtn = page.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) await cookieBtn.click();
    await page.locator('input[name="email"], input[type="email"]').first().fill('doctor@gmail.com');
    await page.locator('input[name="password"], input[type="password"]').first().fill('Password123!');
    await page.locator('button.auth-submit, button[type="submit"], button:has-text("Ingresar")').first().click();
    await page.locator('button:has-text("Continuar")').click({ timeout: 8000 }).catch(() => {});
    await page.waitForURL(/.*(\/vet\/dashboard|\/client|\/dashboard)/, { timeout: 15000, waitUntil: 'domcontentloaded' });

    // Navigate to Queue / Sala de Guardia via sidebar or direct navigation
    const queueNavBtn = page.locator('button:has-text("Cola de atención"), a[href*="/vet/queue"], [data-path="/vet/queue"]').first();
    if (await queueNavBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await queueNavBtn.click();
    } else {
      await page.goto(`${TARGET_URL}/vet/queue`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    }
    await page.waitForSelector('.v-topbar, aside.sidebar, main', { timeout: 10000 });
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/vet/queue');
    await page.screenshot({ path: 'test-results/tc-10-vet-queue.png' });
  });

  test('TC-11: Tutor Pet Dossier & Medical Records (Layer 2 Oracle)', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const cookieBtn = page.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) await cookieBtn.click();
    await page.locator('input[name="email"], input[type="email"]').first().fill('tobias@gmail.com');
    await page.locator('input[name="password"], input[type="password"]').first().fill('Password123!');
    await page.locator('button.auth-submit, button[type="submit"], button:has-text("Ingresar")').first().click();
    await page.locator('button:has-text("Continuar")').click({ timeout: 8000 }).catch(() => {});
    await page.waitForURL(/.*(\/client\/dashboard|\/client|\/dashboard)/, { timeout: 15000, waitUntil: 'domcontentloaded' });

    // Navigate to Pets Dossier
    await page.goto(`${TARGET_URL}/client/pets`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('.c-shell, .app-shell, aside.sidebar, main', { timeout: 10000 });
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/client/pets');
    await page.screenshot({ path: 'test-results/tc-11-client-pets.png' });
  });

  test('TC-12: Digital Prescription & SENASA Verification Portal (Layer 1 Oracle)', async ({ page }) => {
    await page.goto(`${TARGET_URL}/verify-rx`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const cookieBtn = page.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) await cookieBtn.click();
    await page.waitForSelector('main, .rx-view, input, button', { timeout: 10000 });
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/verify-rx');
    await page.screenshot({ path: 'test-results/tc-12-verify-rx.png' });
  });

  test('TC-13: User Registration & Onboarding Flow (Layer 2 Oracle)', async ({ page }) => {
    await page.goto(`${TARGET_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const cookieBtn = page.locator('button:has-text("Solo Necesarias"), button:has-text("Aceptar")').first();
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) await cookieBtn.click();
    await page.waitForSelector('main, form, input, button', { timeout: 10000 });
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
    await page.screenshot({ path: 'test-results/tc-13-register.png' });
  });
});
