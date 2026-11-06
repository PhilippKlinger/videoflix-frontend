import { test, expect } from '@playwright/test';

test('unknown url shows the not found page', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', msg => messages.push(msg.text()));

  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

  await page.getByRole('link', { name: 'Back to start' }).click();
  await expect(page).toHaveURL(/\/$/);

  // Without a fallback route the router logs NG04002 and renders nothing.
  expect(messages.filter(m => m.includes('NG04002'))).toEqual([]);
});
