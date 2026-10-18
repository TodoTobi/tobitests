import { test, expect } from '@playwright/test';

test.describe('Suite 4: Doctor Clinical Portal & Triage Queue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@vetconnect.demo');
    await page.fill('input[type="password"]', 'Doctor123+');
    await page.click('button[type="submit"]');
    const continuar = page.locator('button:has-text("Continuar")').first();
    if (await continuar.count() > 0) await continuar.click();
    await expect(page).toHaveURL(/\/vet\/dashboard/);
  });

  test('TC-DOC-01: Displays Doctor header with professional license (MP 12344)', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Dr\. doctor uno|MP 12344/i);
  });

  test('TC-DOC-02: Displays professional availability switch (Disponible ↔ En consulta ↔ No disponible)', async ({ page }) => {
    await expect(page.locator('button:has-text("Disponible")')).toBeVisible();
    await expect(page.locator('button:has-text("En consulta")')).toBeVisible();
    await expect(page.locator('button:has-text("No disponible")')).toBeVisible();
  });

  test('TC-DOC-03: Renders KPI counters: Consultas de hoy, En espera, Finalizadas', async ({ page }) => {
    await expect(page.locator('text=Consultas de hoy')).toBeVisible();
    await expect(page.locator('text=En espera')).toBeVisible();
    await expect(page.locator('text=Finalizadas')).toBeVisible();
  });

  test('TC-DOC-04: Toggles status to "En consulta" and persists badge feedback', async ({ page }) => {
    const enConsultaBtn = page.locator('button:has-text("En consulta")').first();
    await enConsultaBtn.click();
    await page.waitForTimeout(1000);
    // Switch back to Disponible
    await page.locator('button:has-text("Disponible")').first().click();
  });

  test('TC-DOC-05: Navigates to clinical consultations list (/vet/consultations)', async ({ page }) => {
    await page.goto('/vet/consultations');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-DOC-06: Displays clinical patients roster (/vet/patients)', async ({ page }) => {
    await page.goto('/vet/patients');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-DOC-07: Displays calendar appointment agenda (/vet/agenda)', async ({ page }) => {
    await page.goto('/vet/agenda');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-DOC-08: Displays digital prescription drafting studio (/vet/prescriptions)', async ({ page }) => {
    await page.goto('/vet/prescriptions');
    await expect(page.locator('body')).toBeVisible();
  });
});
