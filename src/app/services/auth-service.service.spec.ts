import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth-service.service';
import { VideoService } from './video.service';
import { CurrentUser } from '../models/user.model';
import { Video } from '../models/video.model';
import { TEST_VIDEO } from '../testing/video.fixture';

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

  it('startDemo replaces the session with the demo account', () => {
    let current = null as CurrentUser | null;
    service.currentUser$.subscribe(u => current = u);

    service.startDemo().subscribe();
    httpMock.expectOne('/api/demo/').flush({ detail: 'demo started' }, { status: 201, statusText: 'Created' });
    httpMock.expectOne('/api/me/').flush({ id: 2, email: 'demo-1@demo.invalid', role: 'demo' });

    expect(current?.role).toBe('demo');
  });

  describe('account switch', () => {
    let videos: Video[] | null | undefined;

    beforeEach(() => {
      const videoService = TestBed.inject(VideoService);
      videoService.videos$.subscribe(v => videos = v);
      videoService.loadVideos();
      httpMock.expectOne('/api/video/').flush([{ ...TEST_VIDEO, id: 1, is_own: true, visibility: 'private' }]);
    });

    it('login forgets the video list of the previous account', () => {
      service.login({ email: 'a@b.de', password: 'pw' }).subscribe();
      expect(videos).toBeNull();
      httpMock.expectOne('/api/login/').flush({});
      httpMock.expectOne('/api/me/').flush(user);
    });

    it('startDemo forgets the video list of the previous account', () => {
      service.startDemo().subscribe();
      expect(videos).toBeNull();
      httpMock.expectOne('/api/demo/').flush({}, { status: 201, statusText: 'Created' });
      httpMock.expectOne('/api/me/').flush({ id: 2, email: 'demo-1@demo.invalid', role: 'demo' });
    });

    it('logout forgets the video list', () => {
      service.logout().subscribe();
      httpMock.expectOne('/api/logout/').flush({});
      expect(videos).toBeNull();
    });
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
