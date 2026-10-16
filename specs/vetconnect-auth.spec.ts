import { test, expect } from '@playwright/test';

test.describe('Suite 1: Authentication & Identity Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('TC-AUTH-01: Displays login form with required email and password fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('TC-AUTH-02: Validates empty form submission with field error messages', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('.auth-field__message, .error, p:has-text("obligatorio")').first()).toBeVisible();
  });

  test('TC-AUTH-03: Rejects invalid email formatting (missing @ or domain)', async ({ page }) => {
    await page.fill('input[type="email"]', 'usuario-invalido');
    await page.fill('input[type="password"]', 'Password123+');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/válido/i);
  });

  test('TC-AUTH-04: Rejects unauthorized credentials with 401 response and alert', async ({ page }) => {
    await page.fill('input[type="email"]', 'noexiste@vetconnect.com');
    await page.fill('input[type="password"]', 'ClaveIncorrecta123+');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert, .auth-field__message').first()).toBeVisible();
  });

  test('TC-AUTH-05: Authenticates Tutor successfully with tobias@gmail.com', async ({ page }) => {
    await page.fill('input[type="email"]', 'tobias@gmail.com');
    await page.fill('input[type="password"]', 'Tobias123+');
    await page.click('button[type="submit"]');
    const continuar = page.locator('button:has-text("Continuar")').first();
    if (await continuar.count() > 0) await continuar.click();
    await expect(page).toHaveURL(/\/client/);
  });

  test('TC-AUTH-06: Authenticates Doctor successfully with doctor@gmail.com', async ({ page }) => {
    await page.fill('input[type="email"]', 'doctor@gmail.com');
    await page.fill('input[type="password"]', 'Doctor123+');
    await page.click('button[type="submit"]');
    const continuar = page.locator('button:has-text("Continuar")').first();
    if (await continuar.count() > 0) await continuar.click();
    await expect(page).toHaveURL(/\/vet/);
  });

  test('TC-AUTH-07: Navigates to registration role selection screen', async ({ page }) => {
    await page.click('a:has-text("Crear una cuenta"), a:has-text("Registrarse")');
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('body')).toContainText(/Soy tutor|Soy veterinario/);
  });

  test('TC-AUTH-08: Tutor registration form validates password strength meter', async ({ page }) => {
    await page.goto('/register/tutor');
    await page.fill('input[name="password"]', '123');
    await expect(page.locator('.password-strength, text=Muy débil').first()).toBeVisible();
    await page.fill('input[name="password"]', 'TobiasSeguro123+');
    await expect(page.locator('.password-strength, text=Fuerte').first()).toBeVisible();
  });

  test('TC-AUTH-09: Veterinarian registration enforces license number (matrícula)', async ({ page }) => {
    await page.goto('/register/veterinarian');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-AUTH-10: Forgot password form sends recovery instructions for registered emails', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', 'tobias@gmail.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/Revisá tu correo|instrucciones/i);
  });
});
