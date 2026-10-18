import { test, expect } from '@playwright/test';

test.describe('VetConnect — Appointments & Consultation Sync', () => {
  test('verifies compliance pages render properly (/privacy, /terms)', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/terms');
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * Escenario BDD: BUG-01
   * Nombre y sección: (BUG-01: Inconsistencia al cancelar consulta entre Mensajes y Mascotas, seccion: Mensajes / Consultas).
   * 
   * Pasos para reproducir:
   * Dado que el operador tiene una consulta activa ("En consulta") registrada para una mascota.
   * Cuando el operador accede a la sección "Mensajes" y presiona el botón "Cancelar".
   * Entonces el mensaje es removido de la bandeja (resultado real obtenido), pero al navegar a "Mascotas -> Tus consultas",
   * el registro de la consulta sigue figurando erróneamente en estado "En consulta" (resultado real obtenido)
   * cuando debería figurar como cancelado o haber sido eliminado de forma sincronizada en ambas secciones (resultado esperado).
   */
  test('BUG-01: Inconsistencia al cancelar consulta entre Mensajes y Mascotas', async ({ page }) => {
    // 1. Dado que el operador accede como tutor autenticado
    await page.goto('/login');
    await page.fill('input[type="email"]', 'tutor@vetconnect.demo');
    await page.fill('input[type="password"]', 'demo_password_123');
    await page.click('button[type="submit"]');

    const continuar = page.locator('button:has-text("Continuar")').first;
    if (await continuar.count() > 0) {
      await continuar.click();
    }

    // 2. Cuando el operador accede a la sección "Mensajes" y presiona el botón "Cancelar"
    await page.goto('/client/messages');
    const cancelBtn = page.locator('button:has-text("Cancelar"), button:has-text("Cancelar Consulta")').first;
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
    }

    // 3. Entonces el mensaje es removido de la bandeja (resultado real obtenido)
    // Pero al navegar a "Mascotas -> Tus consultas":
    await page.goto('/client/consultations');
    
    // Verificación de divergencia:
    const activeConsultation = page.locator('.consultation-card:has-text("En consulta"), .badge:has-text("Confirmada")');
    // Esperado: La consulta debe figurar como cancelada o removida de forma sincronizada
  });

  test('Doctor portal session and status audit (doctor@vetconnect.demo)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@vetconnect.demo');
    await page.fill('input[type="password"]', 'Doctor123+');
    await page.click('button[type="submit"]');

    const continuar = page.locator('button:has-text("Continuar")').first;
    if (await continuar.count() > 0) {
      await continuar.click();
    }

    await expect(page).toHaveURL(/\/vet\/dashboard/);
    await expect(page.locator('body')).toContainText('doctor');
  });
});
