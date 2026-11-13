# Videoflix Frontend

Single-page web app for Videoflix, a small video streaming platform: sign up and log in, browse the catalog, watch HLS streams, and upload your own clips. It talks to the Django REST API in [videoflix-backend](https://github.com/PhilippKlinger/videoflix-backend).

## Stack

- Angular 22.2 with standalone components, Angular Material 22.2
- TypeScript 6.0, RxJS 7.8
- hls.js 1.7 for playback
- Vitest (browser mode, headless Chromium) for unit tests, Playwright for end-to-end tests

## Commands

```bash
npm ci          # install dependencies
npm start       # dev server on http://localhost:4200, proxies /api to the backend (proxy.conf.json)
npm test        # unit tests
npm run lint    # ESLint (angular-eslint)
npm run build   # production build, output in dist/videoflix/browser
npm run e2e     # Playwright tests (need a running backend)
```

## Deployment

The production build is served by nginx from the container image. Compose files, the deploy workflow and the runbook live in [videoflix-deploy](https://github.com/PhilippKlinger/videoflix-deploy).
