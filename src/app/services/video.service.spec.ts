import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { HttpTestingController } from '@angular/common/http/testing';
import { VideoService } from './video.service';
import { StreamStats, Video } from '../models/video.model';
import { TEST_VIDEO } from '../testing/video.fixture';

describe('VideoService', () => {
  let service: VideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(VideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sorts videos by created_at, newest first', () => {
    let videos: Video[] = [];
    service.videos$.subscribe(v => videos = v ?? []);
    service.loadVideos();
    TestBed.inject(HttpTestingController).expectOne('/api/video/').flush([
      { ...TEST_VIDEO, id: 1, created_at: '2026-01-01T00:00:00Z' },
      { ...TEST_VIDEO, id: 2, created_at: '2026-03-01T00:00:00Z' },
    ]);
    expect(videos.map(v => v.id)).toEqual([2, 1]);
  });

  it('starts with null, so an empty list is not mistaken for loading', () => {
    let videos: Video[] | null | undefined;
    service.videos$.subscribe(v => videos = v);
    expect(videos).toBeNull();
    service.loadVideos();
    TestBed.inject(HttpTestingController).expectOne('/api/video/').flush([]);
    expect(videos).toEqual([]);
  });

  it('keeps the loaded list when a reload fails', () => {
    let videos: Video[] | null | undefined;
    service.videos$.subscribe(v => videos = v);
    vi.spyOn(console, 'error').mockReturnValue(undefined);
    const httpMock = TestBed.inject(HttpTestingController);
    service.loadVideos();
    httpMock.expectOne('/api/video/').flush([{ ...TEST_VIDEO, id: 1 }]);
    service.loadVideos();
    httpMock.expectOne('/api/video/').flush({}, { status: 502, statusText: 'Bad Gateway' });
    expect(videos?.map(v => v.id)).toEqual([1]);
  });

  it('clear forgets the list of the previous account', () => {
    let videos: Video[] | null | undefined;
    service.videos$.subscribe(v => videos = v);
    service.loadVideos();
    TestBed.inject(HttpTestingController).expectOne('/api/video/').flush([{ ...TEST_VIDEO, id: 1 }]);
    service.clear();
    expect(videos).toBeNull();
  });

  it('ends loading with an empty list when the request fails', () => {
    let videos: Video[] | null | undefined;
    service.videos$.subscribe(v => videos = v);
    vi.spyOn(console, 'error').mockReturnValue(undefined);
    service.loadVideos();
    TestBed.inject(HttpTestingController).expectOne('/api/video/').flush({}, { status: 500, statusText: 'Server Error' });
    expect(videos).toEqual([]);
  });

  it('marks a failed first load, and clears the mark with the next success', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);
    service.loadVideos();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/video/').flush({}, { status: 500, statusText: 'Server Error' });
    expect(service.loadFailed()).toBe(true);

    service.loadVideos();
    http.expectOne('/api/video/').flush([]);
    expect(service.loadFailed()).toBe(false);
  });

  it('keeps the failed mark when a retry fails again', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);
    const http = TestBed.inject(HttpTestingController);
    service.loadVideos();
    http.expectOne('/api/video/').flush({}, { status: 500, statusText: 'Server Error' });
    service.loadVideos();
    http.expectOne('/api/video/').flush({}, { status: 500, statusText: 'Server Error' });
    expect(service.loadFailed()).toBe(true);
  });

  it('clear resets the failed mark', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);
    service.loadVideos();
    TestBed.inject(HttpTestingController).expectOne('/api/video/').flush({}, { status: 500, statusText: 'Server Error' });
    service.clear();
    expect(service.loadFailed()).toBe(false);
  });

  it('maps getStreams to the streams array', () => {
    let result: StreamStats[] | undefined;
    service.getStreams(7).subscribe(streams => result = streams);
    const stream = { resolution: '720p', bitrate_kbps: 1300, segment_count: 26, segment_seconds: 4, duration_seconds: 103.4, size_bytes: 17000000 };
    TestBed.inject(HttpTestingController).expectOne('/api/video/7/streams/').flush({ streams: [stream] });
    expect(result).toEqual([stream]);
  });
});
