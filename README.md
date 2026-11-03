# Videoflix

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.12.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

The end-to-end tests use [Playwright](https://playwright.dev) and run against the local dev stack:

1. Start the backend with `docker compose --profile dev up -d` (includes Mailpit for the activation mails).
2. Start the frontend with `npm start`.
3. Once: `npx playwright install chromium`.
4. Run `npm run e2e`. The report is written to `playwright-report/`.

The backend allows 5 registration mails per hour and IP, so the auth smoke can run up to 5 times per hour.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
