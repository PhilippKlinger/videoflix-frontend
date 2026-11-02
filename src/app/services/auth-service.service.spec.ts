import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth-service.service';
import { CurrentUser } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const user: CurrentUser = { id: 1, email: 'a@b.de', role: 'member' };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login stores the user from /api/me/ and nothing in localStorage', () => {
    let current = null as CurrentUser | null;
    service.currentUser$.subscribe(u => current = u);

    service.login({ email: 'a@b.de', password: 'pw' }).subscribe();
    httpMock.expectOne('/api/login/').flush({ detail: 'login successfully' });
    httpMock.expectOne('/api/me/').flush(user);

    expect(current).toEqual(user);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('loadCurrentUser calls /api/me/ only once', () => {
    service.loadCurrentUser().subscribe();
    httpMock.expectOne('/api/me/').flush(user);

    let second: CurrentUser | undefined;
    service.loadCurrentUser().subscribe(u => second = u);
    httpMock.expectNone('/api/me/');
    expect(second).toEqual(user);
  });

  it('logout clears the session even if the server answers 401', () => {
    service.loadCurrentUser().subscribe();
    httpMock.expectOne('/api/me/').flush(user);

    let current = user as CurrentUser | null;
    service.currentUser$.subscribe(u => current = u);
    let completed = false;
    let failed = false;
    service.logout().subscribe({ complete: () => completed = true, error: () => failed = true });
    httpMock.expectOne('/api/logout/').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(current).toBeNull();
    expect(completed).toBeTrue();
    expect(failed).toBeFalse();
  });
});
