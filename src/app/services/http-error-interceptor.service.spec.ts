import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpContext } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HttpErrorInterceptor, SHOWS_OWN_ERRORS } from './http-error-interceptor.service';
import { ErrorHandlingService } from './error-handling.service';
import { provideAppHttpClient } from '../http.providers';

describe('HttpErrorInterceptorService', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let logSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        provideAppHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    logSpy = spyOn(TestBed.inject(ErrorHandlingService), 'log');
  });

  afterEach(() => httpMock.verify());

  it('does not log errors the calling component shows itself', () => {
    const context = new HttpContext().set(SHOWS_OWN_ERRORS, true);
    http.post('/api/demo/', {}, { context }).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/demo/').flush({ detail: 'Request was throttled. Expected available in 3599 seconds.' }, { status: 429, statusText: 'Too Many Requests' });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('does not log 401', () => {
    http.get('/api/me/').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/me/').flush({ detail: 'Authentication credentials were not provided.' }, { status: 401, statusText: 'Unauthorized' });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs a friendly message instead of the CSRF detail', () => {
    http.post('/api/upload/', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/upload/').flush({ detail: 'CSRF Failed: CSRF token missing.' }, { status: 403, statusText: 'Forbidden' });
    expect(logSpy).toHaveBeenCalledWith('Your session could not be verified. Please reload the page and try again.');
  });

  it('logs other 403 details unchanged', () => {
    http.post('/api/upload/', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/upload/').flush({ detail: 'You do not have permission to perform this action.' }, { status: 403, statusText: 'Forbidden' });
    expect(logSpy).toHaveBeenCalledWith('You do not have permission to perform this action.');
  });
});
