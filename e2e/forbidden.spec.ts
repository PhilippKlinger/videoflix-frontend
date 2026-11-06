import { test, expect } from '@playwright/test';

// A valid session with a valid CSRF token still must not reach admin endpoints.
test('demo account gets 403 on an admin endpoint', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try demo' }).click();
  await expect(page).toHaveURL(/\/browse$/);

  const csrf = (await page.context().cookies()).find(c => c.name === 'csrftoken');
  expect(csrf, 'csrftoken cookie').toBeTruthy();

  const response = await page.request.post('/api/clear-cache/', { headers: { 'X-CSRFToken': csrf!.value } });
  expect(response.status()).toBe(403);
  // A CSRF failure is a 403 as well; this one has to come from the permission check.
  expect((await response.json()).detail).not.toMatch(/csrf/i);
});
