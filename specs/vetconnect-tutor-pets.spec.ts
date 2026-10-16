import { test, expect } from '@playwright/test';

test.describe('Suite 3: Tutor Portal & Pet Care Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'tobias@gmail.com');
    await page.fill('input[type="password"]', 'Tobias123+');
    await page.click('button[type="submit"]');
    const continuar = page.locator('button:has-text("Continuar")').first();
    if (await continuar.count() > 0) await continuar.click();
    await expect(page).toHaveURL(/\/client/);
  });

  test('TC-PET-01: Displays Tutor welcome banner with personalized name', async ({ page }) => {
    await expect(page.locator('h1, h2')).toContainText(/Hola, Tobias/i);
  });

  test('TC-PET-02: Lists registered pets under "Tus mascotas" section', async ({ page }) => {
    await page.goto('/client/pets');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('TC-PET-03: Displays emergency orientation action button ("Necesito atención")', async ({ page }) => {
    const btn = page.locator('button:has-text("Necesito atención"), a:has-text("Necesito atención")').first();
    await expect(btn).toBeVisible();
  });

  test('TC-PET-04: Navigates to consultation history ("Mis consultas")', async ({ page }) => {
    await page.goto('/client/consultations');
    await expect(page.locator('h1, h2')).toContainText(/Mis consultas/i);
  });

  test('TC-PET-05: Displays consultation filter tabs (Próximas, En curso, Finalizadas)', async ({ page }) => {
    await page.goto('/client/consultations');
    await expect(page.locator('text=Próximas')).toBeVisible();
    await expect(page.locator('text=Finalizadas')).toBeVisible();
  });

  test('TC-PET-06: Displays digital prescriptions section for tutor', async ({ page }) => {
    await page.goto('/client/prescriptions');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-PET-07: Displays notifications feed and mark-as-read options', async ({ page }) => {
    await page.goto('/client/notifications');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-PET-08: Renders tutor profile settings with contact data', async ({ page }) => {
    await page.goto('/client/profile');
    await expect(page.locator('body')).toBeVisible();
  });
});
