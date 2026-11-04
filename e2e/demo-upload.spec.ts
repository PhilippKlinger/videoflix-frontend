import { test, expect, Page } from '@playwright/test';
import path from 'node:path';

// Playwright's bundled Chromium cannot decode H.264/AAC; the installed Chrome can.
test.use({ channel: 'chrome' });

const CLIP = path.join(__dirname, 'fixtures', 'test-clip.mp4');
const title = `E2E clip ${Date.now()}`;

interface ApiVideo {
  title: string;
  status: string;
  resolutions: { resolution: string }[];
}

/** Waits until the backend has converted all resolutions, so the player can switch. */
async function waitForAllResolutions(page: Page): Promise<void> {
  await expect.poll(async () => {
    const videos: ApiVideo[] = await (await page.request.get('/api/video/')).json();
    return videos.find(v => v.title === title)?.resolutions.length ?? 0;
  }, { timeout: 120_000, intervals: [2_000] }).toBe(3);
}

// Release path (masterplan): try demo → upload → conversion → playback → delete.
test.describe.serial('demo upload', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('starts a demo from the start page', async () => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Try demo' }).click();
    await expect(page).toHaveURL(/\/browse$/);
    await expect(page.getByText('Demo account: this account and your uploads are deleted automatically after 2 hours.')).toBeVisible();
    await expect(page.getByText('0 of 2 used')).toBeVisible();
  });

  test('uploads a video and sees it converted', async () => {
    test.setTimeout(150_000);
    await page.getByRole('link', { name: 'Upload video' }).click();
    await expect(page).toHaveURL(/\/upload$/);

    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Description').fill('Uploaded by the E2E test.');
    await page.getByLabel('Genre').click();
    await page.getByRole('option', { name: 'Action' }).click();
    await page.locator('input[type="file"]').setInputFiles(CLIP);
    await page.getByRole('button', { name: 'Upload' }).click();

    await expect(page).toHaveURL(/\/browse$/);
    await expect(page.getByText('1 of 2 used')).toBeVisible();
    // The row polls the status and shows the play button once a resolution is ready.
    await expect(page.getByRole('button', { name: `Play ${title}` })).toBeVisible({ timeout: 120_000 });

    await waitForAllResolutions(page);
    await page.reload();
  });

  test('plays the video', async () => {
    await page.getByRole('button', { name: `Play ${title}` }).click();
    const video = page.locator('video');
    await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).currentTime), { timeout: 30_000 })
      .toBeGreaterThan(0);
  });

  test('keeps resolution menu and close button usable in fullscreen', async () => {
    await page.getByRole('button', { name: 'Fullscreen' }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true);
    // The video fills the screen; black bars only come from a different aspect ratio.
    await expect.poll(() => page.evaluate(() => {
      const box = document.querySelector('video')!.getBoundingClientRect();
      return box.width === window.innerWidth && box.height === window.innerHeight;
    })).toBe(true);

    await page.getByRole('button', { name: /^Resolution / }).click();
    await page.getByRole('menuitem', { name: '480p' }).click();
    await expect(page.getByRole('button', { name: 'Resolution 480p' })).toBeVisible();

    await page.getByRole('button', { name: 'Close player' }).click();
    await expect(page.locator('video')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('deletes the video and frees the slot', async () => {
    await page.getByRole('button', { name: 'Delete' }).click();
    const confirm = page.getByRole('group', { name: `Delete ${title}` });
    await expect(confirm.getByText('Delete this video?')).toBeVisible();
    await confirm.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('0 of 2 used')).toBeVisible();
    await expect(page.getByRole('button', { name: `Play ${title}` })).toHaveCount(0);
  });
});
