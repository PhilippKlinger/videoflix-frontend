import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { provideAppHttpClient } from './http.providers';

describe('provideAppHttpClient', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideAppHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    document.cookie = 'csrftoken=test-token; path=/';
  });

  afterEach(() => {
    document.cookie = 'csrftoken=; path=/; max-age=0';
    httpMock.verify();
  });

  it('sends X-CSRFToken from the csrftoken cookie on POST', () => {
    http.post('/api/logout/', {}).subscribe();
    const req = httpMock.expectOne('/api/logout/');
    expect(req.request.headers.get('X-CSRFToken')).toBe('test-token');
    req.flush({});
  });

  it('does not send X-CSRFToken on GET', () => {
    http.get('/api/me/').subscribe();
    const req = httpMock.expectOne('/api/me/');
    expect(req.request.headers.get('X-CSRFToken')).toBeNull();
    req.flush({});
  });
});
