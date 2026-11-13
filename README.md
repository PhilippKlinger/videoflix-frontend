# Videoflix Frontend

Single-page web app for Videoflix, a small video streaming platform: sign up and log in, browse the catalog, watch HLS streams, and upload your own clips. It talks to the Django REST API in [videoflix-backend](https://github.com/PhilippKlinger/videoflix-backend).

[![CI](https://github.com/PhilippKlinger/videoflix-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/PhilippKlinger/videoflix-frontend/actions/workflows/ci.yml)
[![CodeQL](https://github.com/PhilippKlinger/videoflix-frontend/actions/workflows/codeql.yml/badge.svg)](https://github.com/PhilippKlinger/videoflix-frontend/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/PhilippKlinger/videoflix-frontend/badge)](https://scorecard.dev/viewer/?uri=github.com/PhilippKlinger/videoflix-frontend)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-videoflix.philipp--klinger.com-informational)](https://videoflix.philipp-klinger.com)

## Overview

- Sign up with mail activation, log in, reset the password, or start a demo account with one click
- Browse the catalog and play videos with hls.js, with a resolution menu and fullscreen
- Upload your own clips and follow the conversion status until they are playable
- "Under the hood" switch that shows the technical details of each stream

How the app, the API and the worker fit together: [upload-to-playback diagram](https://github.com/PhilippKlinger/videoflix-backend#readme) in the backend and the [stack diagram](https://github.com/PhilippKlinger/videoflix-deploy#readme) in videoflix-deploy.

## Tech stack

- Angular 22.2 with standalone components, Angular Material 22.2
- TypeScript 6.0, RxJS 7.8
- hls.js 1.7 for playback
- Vitest (browser mode, headless Chromium) for unit tests, Playwright for end-to-end tests

## Getting started

```bash
npm ci          # install dependencies
npm start       # dev server on http://localhost:4200, proxies /api to the backend (proxy.conf.json)
npm test        # unit tests
npm run lint    # ESLint (angular-eslint)
npm run build   # production build, output in dist/videoflix/browser
npm run e2e     # Playwright tests (need a running backend)
```

## Testing and CI

Every pull request to `main` must pass these checks before a merge:

- **Test and build:** ESLint, unit tests with a coverage gate, production build with strict templates
- **E2E (Compose stack):** Playwright against the real backend stack (sign-up, login, demo, upload, playback, layout, accessibility with axe)
- **Security checks:** secret scan (gitleaks), dependency review, `npm audit`, workflow lint (zizmor)
- **CodeQL** for TypeScript and the workflows

The image job builds the nginx image and scans it with Trivy on every pull request; on `main` it publishes the image to GHCR.

## Deployment

The production build is served by nginx from the container image. Compose files, the deploy workflow and the runbook live in [videoflix-deploy](https://github.com/PhilippKlinger/videoflix-deploy).

## Related repositories

| Repository | Role |
|---|---|
| [videoflix-backend](https://github.com/PhilippKlinger/videoflix-backend) | Django REST API, upload and HLS conversion |
| [videoflix-deploy](https://github.com/PhilippKlinger/videoflix-deploy) | Production stack: images by digest, deploy with smoke test and rollback, backup and restore test |
| [vps-edge](https://github.com/PhilippKlinger/vps-edge) | Reverse proxy with TLS and security headers in front of the stack |

## License

[MIT](LICENSE)
