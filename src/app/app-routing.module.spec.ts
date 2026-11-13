import { Type } from '@angular/core';
import { Route } from '@angular/router';

import { routes } from './app-routing.module';
import { AuthGuard } from './services/auth-guard.service';
import { HomeComponent } from './authentication/home/home.component';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ActivateComponent } from './authentication/activate/activate.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { BrowseComponent } from './main-view/browse/browse.component';
import { VideoUploadComponent } from './main-view/video-upload/video-upload.component';
import { ImprintComponent } from './legal/imprint.component';
import { PrivacyComponent } from './legal/privacy.component';
import { NotFoundComponent } from './not-found/not-found.component';

describe('app routes', () => {
  const expected: [
    string,
    Type<unknown>
  ][] = [
    ['', HomeComponent],
    ['login', LoginComponent],
    ['register', RegisterComponent],
    ['forgot-password', ForgotPasswordComponent],
    ['activate/:uid/:token', ActivateComponent],
    ['reset-password/:uid/:token', ResetPasswordComponent],
    ['browse', BrowseComponent],
    ['upload', VideoUploadComponent],
    ['impressum', ImprintComponent],
    ['datenschutz', PrivacyComponent],
    ['**', NotFoundComponent],
  ];

  function find(path: string): Route {
    const route = routes.find(r => r.path === path);
    expect(route, path).toBeDefined();
    return route!;
  }

  it('keeps exactly the known paths', () => {
    expect(routes.map(r => r.path)).toEqual(expected.map(([path]) => path));
  });

  for (const [path, component] of expected) {
    it(`lazy-loads the component for '${path}'`, async () => {
      const route = find(path);
      expect(route.component).toBeUndefined();
      expect(route.loadComponent).toBeDefined();
      expect(await route.loadComponent!()).toBe(component);
    });
  }

  it('protects browse and upload with the AuthGuard only', () => {
    for (const route of routes) {
      const guarded = route.path === 'browse' || route.path === 'upload';
      expect(route.canActivate ?? [], route.path!).toEqual(guarded ? [AuthGuard] : []);
    }
  });

  it('keeps the titles of the legal pages', () => {
    expect(find('impressum').title).toBe('Impressum · Videoflix');
    expect(find('datenschutz').title).toBe('Datenschutz · Videoflix');
  });
});
