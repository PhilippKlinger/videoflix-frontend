import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { HttpTestingController } from '@angular/common/http/testing';
import { VideoService } from './video.service';
import { Video } from '../models/video.model';
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
    service.videos$.subscribe(v => videos = v);
    service.loadVideos();
    TestBed.inject(HttpTestingController).expectOne('/api/video/').flush([
      { ...TEST_VIDEO, id: 1, created_at: '2026-01-01T00:00:00Z' },
      { ...TEST_VIDEO, id: 2, created_at: '2026-03-01T00:00:00Z' },
    ]);
    expect(videos.map(v => v.id)).toEqual([2, 1]);
  });
});
