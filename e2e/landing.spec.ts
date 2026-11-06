import { test, expect } from '@playwright/test';
import { BUILD_STORY_URL } from '../src/app/links';

test.describe('landing page', () => {
  test('puts Try demo before Sign up in the tab order', async ({ page }) => {
    await page.goto('/');
    const demo = page.getByRole('button', { name: 'Try demo' });
    await expect(demo).toBeVisible();

    await demo.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeFocused();
  });

  test('leads to register and login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/register$/);

    await page.goto('/');
    await page.getByRole('link', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('links to the build story in a new tab', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'How this was built' });
    await expect(link).toHaveAttribute('href', BUILD_STORY_URL);
    await expect(link).toHaveAttribute('rel', 'noopener');
  });

  test('public start page requests no video data', async ({ page }) => {
    const videoRequests: string[] = [];
    page.on('request', r => {
      if (r.url().includes('/api/video') || r.url().includes('thumbnail')) videoRequests.push(r.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(videoRequests).toEqual([]);
  });

  test('does not overflow horizontally on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
