import { test, expect, Page, BrowserContext } from '@playwright/test';

const MAILPIT_URL = process.env['E2E_MAILPIT_URL'] ?? 'http://localhost:8025';
const email = `smoke-${Date.now()}@example.com`;
const password = 'Smoke-Test-2026!';

/** Reads the activation link from the newest mail to `to` in Mailpit. */
async function activationLink(page: Page, to: string): Promise<string> {
  let messageId: string | undefined;
  await expect.poll(async () => {
    const search = await page.request.get(`${MAILPIT_URL}/api/v1/search`, { params: { query: `to:"${to}"` } });
    messageId = (await search.json()).messages[0]?.ID;
    return messageId;
  }).toBeTruthy();
  const message = await (await page.request.get(`${MAILPIT_URL}/api/v1/message/${messageId}`)).json();
  const link = (message.HTML as string).match(/href="([^"]*\/activate\/[^"]+)"/)?.[1];
  expect(link, 'activation link in mail').toBeTruthy();
  return link!;
}

async function cookie(context: BrowserContext, name: string) {
  return (await context.cookies()).find(c => c.name === name);
}

// One browser session through the whole flow: register → activate → login → refresh → logout.
test.describe.serial('auth smoke', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('registers and activates via the mail link', async () => {
    await page.goto('/register');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page.getByText('Thank you for registering')).toBeVisible();

    const link = await activationLink(page, email);
    // The host comes from FRONTEND_URL; the route must match the Angular router.
    const path = new URL(link).pathname;
    expect(path).toMatch(/^\/activate\/[^/]+\/[^/]+$/);
    await page.goto(path);
    await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
  });

  test('logs in and lands on /browse', async () => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/browse$/);
  });

  test('keeps tokens in HttpOnly cookies, not in localStorage', async () => {
    const context = page.context();
    expect((await cookie(context, 'access_token'))?.httpOnly).toBe(true);
    expect((await cookie(context, 'refresh_token'))?.httpOnly).toBe(true);

    const storage = await page.evaluate(() => JSON.stringify(localStorage));
    expect(storage).not.toMatch(/token/i);
  });

  test('refreshes the access token when it is gone', async () => {
    const context = page.context();
    await context.clearCookies({ name: 'access_token' });

    const refresh = page.waitForResponse(r => r.url().endsWith('/api/token/refresh/'));
    await page.reload();
    expect((await refresh).status()).toBe(200);
    await expect(page).toHaveURL(/\/browse$/);
    expect(await cookie(context, 'access_token')).toBeTruthy();
  });

  test('logs out with CSRF token and guards /browse', async () => {
    const logout = page.waitForResponse(r => r.url().endsWith('/api/logout/'));
    await page.getByText('Log out').click();
    const response = await logout;
    expect(response.request().headers()['x-csrftoken'], 'X-CSRFToken header').toBeTruthy();
    expect(response.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/browse');
    await expect(page).toHaveURL(/\/$/);
  });
});
