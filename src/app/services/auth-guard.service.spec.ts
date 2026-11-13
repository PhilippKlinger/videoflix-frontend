import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth-service.service';
import { provideAppHttpClient } from '../http.providers';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/browse' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppHttpClient(), provideRouter([])] });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
  });

  function run(): boolean | UrlTree | undefined {
    let result: boolean | UrlTree | undefined;
    (guard.canActivate(route, state) as Observable<boolean | UrlTree>).subscribe(r => result = r);
    return result;
  }

  it('allows navigation when /api/me/ succeeds', () => {
    vi.spyOn(authService, 'loadCurrentUser').mockReturnValue(of({ id: 1, email: 'a@b.de', role: 'member' }));
    expect(run()).toBe(true);
  });

  it('returns a UrlTree to / when /api/me/ fails', () => {
    vi.spyOn(authService, 'loadCurrentUser').mockReturnValue(throwError(() => new Error('401')));
    const result = run();
    const router = TestBed.inject(Router);
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
