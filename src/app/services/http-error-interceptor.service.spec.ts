import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { FRIENDLY_ERROR, HttpErrorInterceptor, SHOWS_OWN_ERRORS } from './http-error-interceptor.service';
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
    spyOn(console, 'error');
    const context = new HttpContext().set(SHOWS_OWN_ERRORS, true);
    http.post('/api/demo/', {}, { context }).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/demo/').flush({ detail: 'Request was throttled. Expected available in 3599 seconds.' }, { status: 429, statusText: 'Too Many Requests' });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('still records errors the calling component shows itself for debugging', () => {
    const consoleSpy = spyOn(console, 'error');
    const context = new HttpContext().set(SHOWS_OWN_ERRORS, true);
    http.delete('/api/video/1/', { context }).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/video/1/').flush({ detail: 'Not found.' }, { status: 404, statusText: 'Not Found' });
    expect(consoleSpy).toHaveBeenCalledWith('HTTP error', 'DELETE', '/api/video/1/', 404, { detail: 'Not found.' });
  });

  it('does not log 401', () => {
    http.get('/api/me/').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/me/').flush({ detail: 'Authentication credentials were not provided.' }, { status: 401, statusText: 'Unauthorized' });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('survives an error without a body and hands on the original error', () => {
    spyOn(console, 'error');
    let received: unknown;
    http.get('/api/video/').subscribe({ error: e => received = e });
    httpMock.expectOne('/api/video/').flush(null, { status: 500, statusText: 'Server Error' });
    expect(received).toBeInstanceOf(HttpErrorResponse);
    expect(logSpy).toHaveBeenCalledWith(FRIENDLY_ERROR);
  });

  it('shows a friendly message instead of a server error detail and keeps the details in the console', () => {
    const consoleSpy = spyOn(console, 'error');
    http.get('/api/me/').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/me/').flush({ detail: 'database unavailable' }, { status: 500, statusText: 'Server Error' });
    expect(logSpy).toHaveBeenCalledWith(FRIENDLY_ERROR);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('shows a friendly message on a network error', () => {
    spyOn(console, 'error');
    http.get('/api/me/').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/me/').error(new ProgressEvent('error'));
    expect(logSpy).toHaveBeenCalledWith(FRIENDLY_ERROR);
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
