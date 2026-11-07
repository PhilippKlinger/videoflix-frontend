import { test, expect, Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';

interface ApiVideo {
  is_own: boolean;
  thumbnail_url: string | null;
}

/** Waits for network, images, web fonts and finite CSS animations, so boxes and screenshots are stable. */
async function settled(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    // Lazy images below the fold would stay blank in a full page screenshot.
    const images = [...document.images];
    images.forEach(image => image.loading = 'eager');
    await Promise.all(images.map(image => image.decode().catch(() => undefined)));
    await document.fonts.ready;
    const finite = document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.all(finite.map(a => a.finished.catch(() => undefined)));
  });
}

/** Starts a demo. The CI seed only appears in the catalog once its conversion has finished. */
async function openBrowse(page: Page): Promise<void> {
  test.setTimeout(180_000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Try demo' }).click();
  await expect(page).toHaveURL(/\/browse$/);

  await expect.poll(async () => {
    const videos: ApiVideo[] = await (await page.request.get('/api/video/')).json();
    return videos.some(v => !v.is_own && v.thumbnail_url);
  }, { timeout: 120_000, intervals: [2_000] }).toBe(true);
  await page.reload();
  await expect(page.locator('#newest li').first()).toBeVisible();
}

async function openNotFound(page: Page): Promise<void> {
  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
}

async function openLoginRejected(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(`nobody-${Date.now()}@example.com`);
  await page.getByLabel('Password', { exact: true }).fill('not-a-real-password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Email or password is incorrect.')).toBeVisible();
}

/** Does not submit: the button stays disabled, so no account is created. */
async function openRegisterErrors(page: Page): Promise<void> {
  await page.goto('/register');
  const email = page.getByLabel('Email Address');
  await email.fill('not-an-email');
  await email.blur();
  const password = page.getByLabel('Password', { exact: true });
  await password.fill('short');
  await password.blur();
  await expect(page.getByText('Please enter a valid email')).toBeVisible();
  await expect(page.locator('mat-error', { hasText: 'Use at least 8 characters' })).toBeVisible();
}

async function openForgotPasswordError(page: Page): Promise<void> {
  await page.goto('/forgot-password');
  const email = page.getByLabel('Email Address');
  await email.fill('not-an-email');
  await email.blur();
  await expect(page.getByText('Please enter a valid email')).toBeVisible();
}

/**
 * Checks the default view for technical detail, then turns "Under the hood" on, checks the
 * technical layer like a page and reloads to see that the switch is remembered. It reuses the
 * demo login of the browse page and leaves the switch on.
 */
async function checkUnderTheHood(page: Page, testInfo: TestInfo): Promise<void> {
  const toggle = page.getByRole('switch', { name: 'Under the hood' });
  const heroTech = page.locator('.hero .tech');
  const tileTech = page.locator('#newest li .tech');
  const attestation = page.getByRole('link', { name: /attested image/ });

  await test.step('default view shows no technical details', async () => {
    await expect(toggle).not.toBeChecked();
    await expect(heroTech).toHaveCount(0);
    await expect(tileTech).toHaveCount(0);
    await expect(attestation).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('H.264');
  });

  await test.step('switch shows technical details and survives a reload', async () => {
    await toggle.click();
    await expect(toggle).toBeChecked();
    await expect(heroTech).toHaveText(/^HLS · (\d+p )*\d+p · H\.264 · AAC$/);
    await expect(tileTech.first()).toHaveText(/^\d+ streams?$/);
    await expect(attestation).toHaveAttribute('href', 'https://github.com/PhilippKlinger/videoflix-frontend/attestations');
    await expect(attestation).toHaveAttribute('target', '_blank');

    await page.reload();
    await expect(page.getByRole('switch', { name: 'Under the hood' })).toBeChecked();
    await expect(heroTech).toBeVisible();
  });

  await settled(page);
  await page.screenshot({
    path: path.join('e2e-shots', testInfo.project.name, 'browse-under-the-hood.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await test.step('under the hood: no horizontal overflow', async () => {
    const { scrollWidth, clientWidth } = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return { scrollWidth, clientWidth };
    });
    expect.soft(scrollWidth, 'document scrollWidth').toBeLessThanOrEqual(clientWidth);
  });
  await test.step('under the hood: axe finds no serious or critical violations', () => expectNoAxeFindings(page));
}

/**
 * Opens the details of the first tile with the real keyboard, checks them like a page,
 * and closes them with Escape. It reuses the demo login of the browse page.
 */
async function checkDetailsDialog(page: Page, testInfo: TestInfo): Promise<void> {
  const tile = page.locator('#newest li button').first();
  const dialog = page.getByRole('dialog');

  await test.step('tile opens details with the keyboard', async () => {
    await tile.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Play' })).toBeFocused();
  });

  await settled(page);
  await page.screenshot({
    path: path.join('e2e-shots', testInfo.project.name, 'details.png'),
    animations: 'disabled',
  });
  await test.step('axe finds no serious or critical violations with the details open', () => expectNoAxeFindings(page));

  await test.step('Escape closes the details and returns focus to the tile', async () => {
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(tile).toBeFocused();
  });
}

/**
 * Opens the upload form from the browse page and checks it like a page. It reuses the demo
 * login of the browse page and uploads nothing.
 */
async function checkUploadForm(page: Page, testInfo: TestInfo): Promise<void> {
  await test.step('upload tile opens the form', async () => {
    await page.getByRole('link', { name: 'Upload video' }).click();
    await expect(page).toHaveURL(/\/upload$/);
    await expect(page.getByRole('button', { name: 'Choose video file' })).toBeVisible();
  });

  await settled(page);
  await page.screenshot({
    path: path.join('e2e-shots', testInfo.project.name, 'upload.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await test.step('upload form: no horizontal overflow', async () => {
    const { scrollWidth, clientWidth } = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return { scrollWidth, clientWidth };
    });
    expect.soft(scrollWidth, 'document scrollWidth').toBeLessThanOrEqual(clientWidth);
  });
  await test.step('upload form: axe finds no serious or critical violations', () => expectNoAxeFindings(page));
}

const PAGES: { name: string; open: (page: Page) => Promise<unknown>; then?: (page: Page, testInfo: TestInfo) => Promise<void> }[] = [
  { name: 'home', open: page => page.goto('/') },
  { name: 'login', open: page => page.goto('/login') },
  { name: 'register', open: page => page.goto('/register') },
  { name: 'browse', open: openBrowse, then: async (page, testInfo) => {
    await checkUnderTheHood(page, testInfo);
    await checkDetailsDialog(page, testInfo);
    await checkUploadForm(page, testInfo);
  } },
  { name: 'not-found', open: openNotFound },
  { name: 'login-rejected', open: openLoginRejected },
  { name: 'register-errors', open: openRegisterErrors },
  { name: 'forgot-password-error', open: openForgotPasswordError },
];

async function expectNoAxeFindings(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const findings = violations
    .filter(v => v.impact === 'serious' || v.impact === 'critical')
    .map(v => ({ rule: v.id, impact: v.impact, targets: v.nodes.map(n => n.target.join(' ')) }));
  expect.soft(findings).toEqual([]);
}

/**
 * Field boxes grown by their visible hint or error: a fixed subscript lets long text
 * leave the host box, so the host boxes alone would never touch.
 */
async function overlappingFields(page: Page): Promise<string[]> {
  const fields = await page.locator('mat-form-field').evaluateAll(hosts => hosts.map(host => {
    const parts = [host.querySelector('.mat-mdc-text-field-wrapper')!, ...host.querySelectorAll('mat-hint, mat-error')]
      .filter(part => part.checkVisibility())
      .map(part => part.getBoundingClientRect());
    return {
      label: host.querySelector('mat-label')?.textContent?.trim(),
      top: Math.min(...parts.map(p => p.top)),
      bottom: Math.max(...parts.map(p => p.bottom)),
      left: Math.min(...parts.map(p => p.left)),
      right: Math.max(...parts.map(p => p.right)),
    };
  }));
  expect(fields.length, 'form fields on the page').toBeGreaterThan(1);

  return fields.slice(1)
    .map((next, i) => ({ field: fields[i], next }))
    .filter(({ field, next }) => field.top < next.bottom && next.top < field.bottom
      && field.left < next.right && next.left < field.right)
    .map(({ field, next }) => `${field.label} runs ${field.bottom - next.top}px into ${next.label}`);
}

test.describe('layout', () => {
  test.describe.configure({ timeout: 60_000 });

  // One test per page, because a failed test restarts the worker and a repeated
  // setup would spend another rejected login or demo account. Soft: both checks always report.
  for (const { name, open, then } of PAGES) {
    test(name, async ({ page }, testInfo) => {
      await open(page);
      await settled(page);
      await page.screenshot({
        path: path.join('e2e-shots', testInfo.project.name, `${name}.png`),
        fullPage: true,
        animations: 'disabled',
      });

      await test.step('no horizontal overflow', async () => {
        const { scrollWidth, clientWidth } = await page.evaluate(() => {
          const { scrollWidth, clientWidth } = document.documentElement;
          return { scrollWidth, clientWidth };
        });
        expect.soft(scrollWidth, 'document scrollWidth').toBeLessThanOrEqual(clientWidth);
      });

      await test.step('axe finds no serious or critical violations', () => expectNoAxeFindings(page));

      await then?.(page, testInfo);
    });
  }

  test('form fields do not overlap', async ({ page }) => {
    await page.goto('/register');
    await settled(page);
    expect.soft(await overlappingFields(page), 'with the password hint').toEqual([]);

    await openRegisterErrors(page);
    await settled(page);
    expect(await overlappingFields(page), 'in the error state').toEqual([]);
  });
});
