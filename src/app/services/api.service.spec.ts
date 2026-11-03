import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses the relative /api base', () => {
    expect(service.baseUrl).toBe('/api');
  });

  it('loginUser posts JSON credentials to /api/login/', () => {
    service.loginUser({ email: 'a@b.de', password: 'pw' }).subscribe();
    const req = httpMock.expectOne('/api/login/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.de', password: 'pw' });
    req.flush({ detail: 'login successfully' });
  });

  it('loginUser maps non_field_errors to a message', () => {
    let error: unknown;
    service.loginUser({ email: 'a@b.de', password: 'wrong' }).subscribe({ error: (e) => error = e });
    httpMock.expectOne('/api/login/').flush(
      { non_field_errors: ['Please check your entries and try again.'] },
      { status: 400, statusText: 'Bad Request' }
    );
    expect(error).toBe('Please check your entries and try again.');
  });

  it('logoutUser posts to /api/logout/', () => {
    service.logoutUser().subscribe();
    const req = httpMock.expectOne('/api/logout/');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('getMe reads /api/me/', () => {
    service.getMe().subscribe();
    const req = httpMock.expectOne('/api/me/');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, email: 'a@b.de', role: 'member' });
  });

  it('registerUser sends confirmed_password', () => {
    service.registerUser({ email: 'a@b.de', password: 'secret12', confirmed_password: 'secret12' }).subscribe();
    const req = httpMock.expectOne('/api/register/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.de', password: 'secret12', confirmed_password: 'secret12' });
    req.flush({});
  });

  it('activateAccount gets /api/activate/uid/token/', () => {
    service.activateAccount('MQ', 'abc').subscribe();
    const req = httpMock.expectOne('/api/activate/MQ/abc/');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('forgotPassword posts to /api/password_reset/', () => {
    service.forgotPassword({ email: 'a@b.de' }).subscribe();
    const req = httpMock.expectOne('/api/password_reset/');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('resetPasswordConfirm posts to /api/password_confirm/uid/token/', () => {
    service.resetPasswordConfirm('MQ', 'abc', { new_password: 'secret12', confirm_password: 'secret12' }).subscribe();
    const req = httpMock.expectOne('/api/password_confirm/MQ/abc/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ new_password: 'secret12', confirm_password: 'secret12' });
    req.flush({});
  });

  it('getVideos reads /api/video/', () => {
    service.getVideos().subscribe();
    const req = httpMock.expectOne('/api/video/');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('startDemo posts an empty JSON body to /api/demo/', () => {
    service.startDemo().subscribe();
    const req = httpMock.expectOne('/api/demo/');
    expect(req.request.method).toBe('POST');
    // The backend accepts JSON only, so a plain HTML form cannot start a demo.
    expect(req.request.body).toEqual({});
    req.flush({ detail: 'demo started' }, { status: 201, statusText: 'Created' });
  });

  it('deleteVideo deletes /api/video/1/', () => {
    service.deleteVideo(1).subscribe();
    const req = httpMock.expectOne('/api/video/1/');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('getConversionProgress returns the status', () => {
    let status: string | undefined;
    service.getConversionProgress(1).subscribe(p => status = p.status);
    httpMock.expectOne('/api/conversion-progress/1/').flush({ progress: 40, current_resolution: '480p', status: 'processing' });
    expect(status).toBe('processing');
  });

  it('updateVideo patches /api/video/1/', () => {
    service.updateVideo(1, { title: 'New' }).subscribe();
    const req = httpMock.expectOne('/api/video/1/');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
