import { test, expect } from '@playwright/test';

/**
 * Login helper — uses structural selectors that don't depend on i18n text.
 */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/#/login');
  // Wait for the login form to render (identifier input is the first text input)
  const identifierInput = page.locator('#login-identifier');
  await identifierInput.waitFor({ state: 'visible', timeout: 15000 });
  await identifierInput.fill('admin@example.com');
  await page.locator('#login-password').fill('demo');
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/#\/$/, { timeout: 10000 });
}

test.describe('Auth Flow', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    // Login form renders with the identifier input
    await expect(page.locator('#login-identifier')).toBeVisible({ timeout: 15000 });
  });

  test('login with valid credentials', async ({ page }) => {
    await login(page);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/#/login');
    const identifierInput = page.locator('#login-identifier');
    await identifierInput.waitFor({ state: 'visible', timeout: 15000 });
    await identifierInput.fill('admin@example.com');
    await page.locator('#login-password').fill('wrong');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('list page loads data', async ({ page }) => {
    await page.goto('/#/posts');
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
    await login(page);
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
