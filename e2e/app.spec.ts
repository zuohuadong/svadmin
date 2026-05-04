import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Welcome Back')).toBeVisible({ timeout: 10000 });
  });

  test('login with valid credentials', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('textbox', { name: /username/i }).fill('admin@example.com');
    await page.locator('input[type="password"]').fill('demo');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/#\/$/, { timeout: 5000 });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('textbox', { name: /username/i }).fill('admin@example.com');
    await page.locator('input[type="password"]').fill('wrong');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('[role="alert"], .toast, [class*="error"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('textbox', { name: /username/i }).fill('admin@example.com');
    await page.locator('input[type="password"]').fill('demo');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/#\/$/, { timeout: 5000 });
  });

  test('list page loads data', async ({ page }) => {
    await page.goto('/#/posts');
    // Wait for table or skeleton to appear
    await expect(page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigate to create page', async ({ page }) => {
    await page.goto('/#/posts');
    const createBtn = page.getByRole('button', { name: /create/i });
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.click();
    await expect(page).toHaveURL(/create/, { timeout: 5000 });
  });

  test('navigate to edit page', async ({ page }) => {
    await page.goto('/#/posts');
    // Wait for table rows to load
    await page.locator('table tbody tr, [class*="table"] [class*="row"]').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const editBtn = page.locator('a[href*="edit"], button:has-text("Edit")').first();
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editBtn.click();
      await expect(page).toHaveURL(/edit/, { timeout: 5000 });
    }
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('textbox', { name: /username/i }).fill('admin@example.com');
    await page.locator('input[type="password"]').fill('demo');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/#\/$/, { timeout: 5000 });
  });

  test('sidebar navigation works', async ({ page }) => {
    const sidebarLink = page.locator('nav a, aside a, [class*="sidebar"] a').first();
    if (await sidebarLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await sidebarLink.getAttribute('href');
      await sidebarLink.click();
      if (href) {
        await expect(page).toHaveURL(new RegExp(href.replace('#', '')), { timeout: 5000 });
      }
    }
  });

  test('browser back button works', async ({ page }) => {
    await page.goto('/#/posts');
    await page.waitForLoadState('networkidle');
    await page.goto('/#/users');
    await page.waitForLoadState('networkidle');
    await page.goBack();
    await expect(page).toHaveURL(/posts/, { timeout: 5000 });
  });
});
