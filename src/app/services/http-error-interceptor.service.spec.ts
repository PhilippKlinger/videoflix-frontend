import { TestBed } from '@angular/core/testing';

import { HttpErrorInterceptor } from './http-error-interceptor.service';

describe('HttpErrorInterceptorService', () => {
  let service: HttpErrorInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpErrorInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
