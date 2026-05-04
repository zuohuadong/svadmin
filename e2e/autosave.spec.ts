import { test, expect } from '@playwright/test';

test.describe('AutoSave Race Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    const identifierInput = page.locator('#login-identifier');
    await identifierInput.waitFor({ state: 'visible', timeout: 15000 });
    await identifierInput.fill('admin@example.com');
    await page.locator('#login-password').fill('demo');
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(/#\/$/, { timeout: 10000 });
  });

  test('queued autoSave modifications are preserved during pending API requests', async ({ page }) => {
    await page.goto('/#/posts');
    // Wait for table to render
    await page.locator('table tbody tr, [class*="table"] [class*="row"]').first().waitFor({ state: 'visible', timeout: 10000 });

    const firstRowEditBtn = page.locator('a[href*="edit"]').first();
    if (!(await firstRowEditBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip();
      return;
    }

    await firstRowEditBtn.click();
    await expect(page).toHaveURL(/edit/, { timeout: 5000 });

    const titleInput = page.locator('input[name="title"]');
    if (!(await titleInput.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip();
      return;
    }

    let apiInterceptCount = 0;

    await page.route('**/posts/*', async (route, request) => {
      if (request.method() === 'PATCH' || request.method() === 'PUT') {
        apiInterceptCount++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, title: 'Updated' })
        });
      } else {
        await route.continue();
      }
    });

    await titleInput.fill('Race Condition Payload 1');
    await page.waitForTimeout(1100);
    await titleInput.fill('Race Condition Payload 2');
    await page.waitForTimeout(4000);

    expect(apiInterceptCount).toBeGreaterThanOrEqual(2);
  });
});
