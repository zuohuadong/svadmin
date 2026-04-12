import { test, expect } from '@playwright/test';

// Race Condition Test for autoSave
test.describe('AutoSave Race Conditions', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/#/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/#\/$/, { timeout: 5000 });
  });

  test('queued autoSave modifications are preserved during pending API requests', async ({ page }) => {
    // We navigate to a specific resource edit page where autoSave usually triggers
    // Assuming /#/posts/edit/1 exists or similar, we will just use standard posts creation/edit for demo
    await page.goto('/#/posts');
    const firstRowEditBtn = page.locator('a[href*="edit"]').first();
    await firstRowEditBtn.waitFor({ state: 'visible' });
    await firstRowEditBtn.click();
    await expect(page).toHaveURL(/edit/, { timeout: 5000 });

    // Assuming the 'title' field triggers auto-save
    const titleInput = page.locator('input[name="title"]');
    await titleInput.waitFor({ state: 'visible' });

    let apiInterceptCount = 0;
    
    // Intercept API UPDATE calls and intentionally enforce a massive 2000ms delay. 
    // This allows us to simulate entering a second key while the first save is in-flight.
    await page.route('**/posts/*', async (route, request) => {
      // Only intercept PATCH/PUT requests
      if (request.method() === 'PATCH' || request.method() === 'PUT') {
        apiInterceptCount++;
        // Keep the mocked execution hanging for 2000 milliseconds
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

    // 1. Trigger the first change
    await titleInput.fill('Race Condition Payload 1');
    // Wait for the debounce to trigger the first save (usually ~1000ms based on defaults)
    await page.waitForTimeout(1100); 

    // At this point, the FIRST request is stuck in the 2000ms delay artificially.

    // 2. Trigger the second change QUICKLY before the first completes
    await titleInput.fill('Race Condition Payload 2');

    // 3. Wait for the sum of the delay (1000ms debounce + 2000ms intercept time + buffer)
    await page.waitForTimeout(4000);

    // Assert that the second keystrokes triggered a SECOND request naturally due to `autoSaveDirty` queues,
    // ensuring we didn't drop the user's second burst of input.
    expect(apiInterceptCount).toBeGreaterThanOrEqual(2);
  });
});
