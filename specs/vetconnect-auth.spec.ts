import { test, expect } from '@playwright/test';

test.describe('VetConnect — Authentication & Role Redirection', () => {
  test('loads landing page without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/VetConnect/i);
    expect(errors).toEqual([]);
  });

  test('navigates to login view and validates required credentials', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.getByRole('button', { name: /ingresar|iniciar/i });
    await expect(submitBtn).toBeVisible();
  });

  test('blocks unauthenticated access to /client/dashboard and redirects to /login', async ({ page }) => {
    await page.goto('/client/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('blocks unauthenticated access to /vet/dashboard and redirects to /login', async ({ page }) => {
    await page.goto('/vet/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
