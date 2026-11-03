import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests against the running dev stack:
 * backend `docker compose --profile dev up -d` (incl. Mailpit) and frontend `npm start`.
 */
export default defineConfig({
  testDir: './e2e',
  // One user flow in order; the backend throttles login (5/min) and mails (5/hour).
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
