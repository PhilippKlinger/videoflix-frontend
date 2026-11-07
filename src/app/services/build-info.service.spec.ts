import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BuildInfoService } from './build-info.service';

describe('BuildInfoService', () => {
  let service: BuildInfoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    service = TestBed.inject(BuildInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function load(): unknown {
    let result: unknown = 'pending';
    service.load().subscribe(value => result = value);
    return () => result;
  }

  it('valid json returns the short sha', () => {
    const result = load() as () => unknown;
    httpMock.expectOne('/version.json')
      .flush({ sha: '133f300aabbccddeeff00112233445566778899', builtAt: '2026-11-07T10:00:00Z' });
    expect(result()).toEqual({ sha: '133f300' });
  });

  it("'unknown' returns null", () => {
    const result = load() as () => unknown;
    httpMock.expectOne('/version.json').flush({ sha: 'unknown', builtAt: 'unknown' });
    expect(result()).toBeNull();
  });

  it('the old field name returns null', () => {
    const result = load() as () => unknown;
    httpMock.expectOne('/version.json').flush({ commit: '133f300', build_time: 'x' });
    expect(result()).toBeNull();
  });

  it('html fallback returns null', () => {
    const result = load() as () => unknown;
    httpMock.expectOne('/version.json').flush('<!doctype html><html></html>');
    expect(result()).toBeNull();
  });

  it('http error returns null', () => {
    const result = load() as () => unknown;
    httpMock.expectOne('/version.json').flush('missing', { status: 404, statusText: 'Not Found' });
    expect(result()).toBeNull();
  });
});
