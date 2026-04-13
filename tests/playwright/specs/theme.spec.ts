import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggles from light to dark on login page', async ({ page }) => {
    await expect(page.locator('body')).toHaveClass('light');
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('body')).toHaveClass('dark');
  });

  test('toggles back to light from dark', async ({ page }) => {
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('body')).toHaveClass('dark');
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('body')).toHaveClass('light');
  });

  test('theme persists after login', async ({ page }) => {
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('body')).toHaveClass('dark');
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId('dashboard-title')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('body')).toHaveClass('dark');
  });

  test('theme toggle works on dashboard', async ({ page }) => {
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId('dashboard-title')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('body')).toHaveClass('dark');
  });
});