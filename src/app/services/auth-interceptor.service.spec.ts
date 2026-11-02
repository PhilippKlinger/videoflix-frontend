import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthInterceptor } from './auth-interceptor.service';
import { HttpErrorInterceptor } from './http-error-interceptor.service';
import { AuthService } from './auth-service.service';
import { provideAppHttpClient } from '../http.providers';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let navigateSpy: jasmine.Spy;
  let clearSpy: jasmine.Spy;

  const unauthorized = { status: 401, statusText: 'Unauthorized' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // Same order as AppModule: error handling outside, auth refresh inside.
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        provideAppHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    clearSpy = spyOn(TestBed.inject(AuthService), 'clearSession').and.callThrough();
  });

  afterEach(() => httpMock.verify());

  it('retries the request after a successful refresh', () => {
    let data: unknown;
    http.get('/api/video/').subscribe(d => data = d);

    httpMock.expectOne('/api/video/').flush({}, unauthorized);
    const refresh = httpMock.expectOne('/api/token/refresh/');
    expect(refresh.request.method).toBe('POST');
    refresh.flush({ message: 'access token refreshed' });
    httpMock.expectOne('/api/video/').flush([{ id: 1 }]);

    expect(data).toEqual([{ id: 1 }]);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('refreshes only once for parallel 401s', () => {
    const results: unknown[] = [];
    http.get('/api/video/').subscribe(d => results.push(d));
    http.get('/api/me/').subscribe(d => results.push(d));

    httpMock.expectOne('/api/video/').flush({}, unauthorized);
    httpMock.expectOne('/api/me/').flush({}, unauthorized);
    httpMock.expectOne('/api/token/refresh/').flush({});
    httpMock.expectOne('/api/video/').flush([]);
    httpMock.expectOne('/api/me/').flush({ id: 1 });

    expect(results.length).toBe(2);
  });

  it('ends the session when the refresh fails', () => {
    let error: HttpErrorResponse | undefined;
    http.get('/api/video/').subscribe({ error: e => error = e });

    httpMock.expectOne('/api/video/').flush({}, unauthorized);
    httpMock.expectOne('/api/token/refresh/').flush({ detail: 'No refresh token provided.' }, unauthorized);

    expect(clearSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    expect(error instanceof HttpErrorResponse).toBeTrue();
    expect(error?.status).toBe(401);
  });

  it('does not refresh on 401 from /api/login/', () => {
    http.post('/api/login/', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/login/').flush({}, unauthorized);
    httpMock.expectNone('/api/token/refresh/');
  });

  it('does not refresh on 403', () => {
    let error: HttpErrorResponse | undefined;
    http.post('/api/upload/', {}).subscribe({ error: e => error = e });
    httpMock.expectOne('/api/upload/').flush({ detail: 'CSRF Failed: CSRF token missing.' }, { status: 403, statusText: 'Forbidden' });

    httpMock.expectNone('/api/token/refresh/');
    expect(error?.status).toBe(403);
    expect(clearSpy).not.toHaveBeenCalled();
  });
});
