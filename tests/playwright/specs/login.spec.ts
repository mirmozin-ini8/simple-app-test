import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows login form on load', async ({ page }) => {
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-btn')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByTestId('username-input').fill('wronguser');
    await page.getByTestId('password-input').fill('wrongpass');
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId('error-msg')).toBeVisible();
    await expect(page.getByTestId('error-msg')).toHaveText('Invalid credentials');
  });

  test('redirects to dashboard on valid credentials', async ({ page }) => {
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId('dashboard-title')).toBeVisible({ timeout: 10000 });
  });
});