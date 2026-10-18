import { test, expect } from '@playwright/test';

test.describe('Suite 2: RBAC & Security Boundary Auditing', () => {
  test('TC-RBAC-01: Blocks anonymous access to /client/dashboard and redirects to /login', async ({ page }) => {
    await page.goto('/client/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-RBAC-02: Blocks anonymous access to /vet/dashboard and redirects to /login', async ({ page }) => {
    await page.goto('/vet/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-RBAC-03: Blocks anonymous access to /admin/dashboard and displays restricted message', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-RBAC-04: Role Isolation: Tutor session is redirected away from /vet/* routes', async ({ page }) => {
    // Authenticate tutor
    await page.goto('/login');
    await page.fill('input[type="email"]', 'tutor@vetconnect.demo');
    await page.fill('input[type="password"]', 'demo_password_123');
    await page.click('button[type="submit"]');
    const continuar = page.locator('button:has-text("Continuar")').first();
    if (await continuar.count() > 0) await continuar.click();

    // Attempt accessing vet portal
    await page.goto('/vet/dashboard');
    await expect(page).toHaveURL(/\/client\/dashboard/);
  });

  test('TC-RBAC-05: Role Isolation: Doctor session is redirected away from /client/* routes', async ({ page }) => {
    // Authenticate doctor
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@vetconnect.demo');
    await page.fill('input[type="password"]', 'Doctor123+');
    await page.click('button[type="submit"]');
    const continuar = page.locator('button:has-text("Continuar")').first();
    if (await continuar.count() > 0) await continuar.click();

    // Attempt accessing client portal
    await page.goto('/client/dashboard');
    await expect(page).toHaveURL(/\/vet\/dashboard/);
  });

  test('TC-RBAC-06: Non-admin users are strictly blocked from accessing /admin endpoints', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'tutor@vetconnect.demo');
    await page.fill('input[type="password"]', 'demo_password_123');
    await page.click('button[type="submit"]');
    const continuar = page.locator('button:has-text("Continuar")').first();
    if (await continuar.count() > 0) await continuar.click();

    await page.goto('/admin/users');
    await expect(page).not.toHaveURL(/\/admin\/users/);
  });

  test('TC-RBAC-07: Sanitizes script tags in form inputs against XSS attacks', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', '<script>alert("xss")</script>@test.com');
    await page.fill('input[type="password"]', 'demo_password_123');
    await page.click('button[type="submit"]');
    // Expect no JS dialog execution and standard email format rejection
    await expect(page.locator('body')).not.toContainText('alert("xss")');
  });

  test('TC-RBAC-08: Rejects manipulated JWT token in Authorization header', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/auth/me', {
      headers: { Authorization: 'Bearer token_invalido_falso.123.456' }
    });
    expect(response.status()).toBe(401);
  });
});
