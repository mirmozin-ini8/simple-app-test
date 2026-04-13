import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId('dashboard-title')).toBeVisible({ timeout: 10000 });
  });

  test('shows dashboard title', async ({ page }) => {
    await expect(page.getByTestId('dashboard-title')).toHaveText('Dashboard');
  });

  test('shows api message from backend', async ({ page }) => {
    await expect(page.getByTestId('api-message')).toHaveText('You are authenticated', { timeout: 10000 });
  });

  test('logs out and returns to login', async ({ page }) => {
    await page.getByTestId('logout-btn').click();
    await expect(page.getByTestId('login-btn')).toBeVisible();
  });
});