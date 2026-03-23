import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    // App redirects to login when not authenticated
    await expect(page.locator('text=Login')).toBeVisible({ timeout: 10000 });
  });

  test('login with valid credentials', async ({ page }) => {
    await page.goto('/#/login');
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@example.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');

    // Should redirect to home/dashboard
    await expect(page).toHaveURL(/#\/$/, { timeout: 5000 });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/#/login');
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@example.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');

    // Should show error toast or message
    await expect(page.locator('[role="alert"], .toast, [class*="error"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/#/login');
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@example.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/#\/$/, { timeout: 5000 });
  });

  test('list page loads data', async ({ page }) => {
    await page.goto('/#/posts');
    // Table should render with data rows
    await expect(page.locator('table tbody tr, [class*="table"] [class*="row"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigate to create page', async ({ page }) => {
    await page.goto('/#/posts');
    await page.click('text=Create, button:has-text("Create"), [href*="create"]');
    await expect(page).toHaveURL(/create/, { timeout: 5000 });
  });

  test('navigate to edit page', async ({ page }) => {
    await page.goto('/#/posts');
    // Click edit on first row
    const editBtn = page.locator('a[href*="edit"], button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page).toHaveURL(/edit/, { timeout: 5000 });
    }
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@example.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/#\/$/, { timeout: 5000 });
  });

  test('sidebar navigation works', async ({ page }) => {
    // Click a resource in sidebar
    const sidebarLink = page.locator('nav a, aside a, [class*="sidebar"] a').first();
    if (await sidebarLink.isVisible()) {
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
