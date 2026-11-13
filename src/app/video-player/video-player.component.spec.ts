import type { MockedObject } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type Hls from 'hls.js';
import { TEST_VIDEO } from '../testing/video.fixture';
import { Video } from '../models/video.model';
import { provideAppHttpClient } from '../http.providers';

import { VideoPlayerComponent, pickStartResolution } from './video-player.component';

describe('pickStartResolution', () => {
  it('starts with 720p', () => {
    expect(pickStartResolution(['1080p', '480p', '720p'])).toBe('720p');
  });

  it('falls back to 480p before 1080p', () => {
    expect(pickStartResolution(['1080p', '480p'])).toBe('480p');
  });

  it('takes 1080p when it is the only one', () => {
    expect(pickStartResolution(['1080p'])).toBe('1080p');
  });

  it('returns null without resolutions', () => {
    expect(pickStartResolution([])).toBeNull();
  });
});

describe('VideoPlayerComponent', () => {
  let fixture: ComponentFixture<VideoPlayerComponent>;
  let component: VideoPlayerComponent;
  let httpMock: HttpTestingController;
  let hls: MockedObject<Hls>;

  const converted: Video = {
    ...TEST_VIDEO,
    resolutions: [
      { id: 1, original_video: 1, resolution: '1080p' },
      { id: 2, original_video: 1, resolution: '720p' },
      { id: 3, original_video: 1, resolution: '480p' },
    ],
  };

  function create(video: Video) {
    TestBed.configureTestingModule({
      imports: [VideoPlayerComponent],
      providers: [
        provideAppHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { video } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(VideoPlayerComponent);
    component = fixture.componentInstance;
    // hls.js is a third-party library; the browser's own video element stays real.
    hls = {
      loadSource: vi.fn().mockName('Hls.loadSource'),
      attachMedia: vi.fn().mockName('Hls.attachMedia'),
      destroy: vi.fn().mockName('Hls.destroy'),
      on: vi.fn().mockName('Hls.on')
    } as unknown as MockedObject<Hls>;
    vi.spyOn(component, 'createHls').mockResolvedValue(hls);
    fixture.detectChanges();
  }

  /** The player checks the session first, so an expired access cookie gets refreshed. */
  async function sessionOk() {
    httpMock.expectOne('/api/me/').flush({ id: 1, email: 'a@b.c', role: 'member' });
    await fixture.whenStable();
    // zone.js does not track native async/await under Vitest; let the pending promise chain finish.
    await new Promise(resolve => setTimeout(resolve));
  }

  function videoElement(): HTMLVideoElement {
    return fixture.nativeElement.querySelector('video');
  }

  afterEach(() => httpMock.verify());

  describe('with converted resolutions', () => {
    beforeEach(() => create(converted));

    it('checks the session before it loads the 720p playlist', async () => {
      expect(hls.loadSource).not.toHaveBeenCalled();
      await sessionOk();
      expect(component.selectedResolution).toBe('720p');
      expect(hls.loadSource).toHaveBeenCalledWith('/api/video/1/720p/index.m3u8');
      expect(hls.attachMedia).toHaveBeenCalledWith(videoElement());
    });

    it('shows a friendly message when the session check fails', async () => {
      httpMock.expectOne('/api/me/').flush({}, { status: 500, statusText: 'Server Error' });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(hls.loadSource).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain('This video cannot be played right now');
    });

    it('shows a friendly message on a fatal playback error', async () => {
      await sessionOk();
      const onError = hls.on.mock.lastCall![1] as (event: string, data: { fatal: boolean }) => void;
      onError('hlsError', { fatal: true });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('This video cannot be played right now');
    });

    it('ignores non-fatal playback errors', async () => {
      await sessionOk();
      const onError = hls.on.mock.lastCall![1] as (event: string, data: { fatal: boolean }) => void;
      onError('hlsError', { fatal: false });
      fixture.detectChanges();
      expect(videoElement()).not.toBeNull();
    });

    it('shows the video title', () => {
      httpMock.expectOne('/api/me/').flush({});
      expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Test video');
    });

    it('shows a loading state until the video can play', () => {
      httpMock.expectOne('/api/me/').flush({});
      expect(fixture.nativeElement.querySelector('.loading')).not.toBeNull();
      videoElement().dispatchEvent(new Event('canplay'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.loading')).toBeNull();
    });

    it('hides the native controls while loading, so their spinner does not show twice', () => {
      httpMock.expectOne('/api/me/').flush({});
      expect(videoElement().controls).toBe(false);
      videoElement().dispatchEvent(new Event('canplay'));
      fixture.detectChanges();
      expect(videoElement().controls).toBe(true);
    });

    it('hides the loading state on error and shows the friendly message', async () => {
      await sessionOk();
      videoElement().dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.loading')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('This video cannot be played right now');
    });

    it('offers only the converted resolutions, highest first', () => {
      httpMock.expectOne('/api/me/').flush({});
      expect(component.resolutions).toEqual(['1080p', '720p', '480p']);
    });

    it('switches the playlist and keeps the position', async () => {
      await sessionOk();
      // Without loaded media the element keeps this as its start position (HTML spec).
      videoElement().currentTime = 12;
      await component.onResolutionChange('1080p');
      expect(hls.loadSource).toHaveBeenCalledWith('/api/video/1/1080p/index.m3u8');
      expect(component.selectedResolution).toBe('1080p');
      expect(component.resumeAt).toBe(12);
    });

    it('keeps the first position on a quick second switch', async () => {
      await sessionOk();
      videoElement().currentTime = 12;
      await component.onResolutionChange('1080p');
      videoElement().currentTime = 0;
      await component.onResolutionChange('480p');
      expect(component.resumeAt).toBe(12);
    });

    it('does nothing when the same resolution is chosen again', async () => {
      await sessionOk();
      hls.loadSource.mockClear();
      await component.onResolutionChange('720p');
      expect(hls.loadSource).not.toHaveBeenCalled();
    });

    it('jumps back to the position once the new playlist is loaded', async () => {
      await sessionOk();
      component.resumeAt = 12;
      videoElement().dispatchEvent(new Event('loadedmetadata'));
      expect(videoElement().currentTime).toBe(12);
      expect(component.resumeAt).toBeNull();
    });

    it('shows the thumbnail as poster', () => {
      httpMock.expectOne('/api/me/').flush({});
      expect(videoElement().getAttribute('poster')).toBe(TEST_VIDEO.thumbnail_url);
    });

    it('hides the native fullscreen button and offers its own', () => {
      httpMock.expectOne('/api/me/').flush({});
      expect(videoElement().getAttribute('controlslist')).toContain('nofullscreen');
      const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('.fullscreen-btn');
      expect(button?.getAttribute('aria-label')).toBe('Fullscreen');
    });

    it('labels the fullscreen button for leaving fullscreen', () => {
      httpMock.expectOne('/api/me/').flush({});
      component.isFullscreen = true;
      fixture.detectChanges();
      const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('.fullscreen-btn');
      expect(button?.getAttribute('aria-label')).toBe('Exit fullscreen');
    });

    it('shows resolution and fullscreen in one bar right below the video', () => {
      httpMock.expectOne('/api/me/').flush({});
      const bar: HTMLElement | null = fixture.nativeElement.querySelector('.player-bar');
      expect(videoElement().nextElementSibling).toBe(bar);
      expect(bar?.querySelector('.quality-btn')?.textContent).toContain('720p');
      expect(bar?.querySelector('.fullscreen-btn')).not.toBeNull();
    });

    it('marks the player while in fullscreen, so the video can fill the screen', () => {
      httpMock.expectOne('/api/me/').flush({});
      const overlay: HTMLElement = fixture.nativeElement.querySelector('.player-overlay');
      expect(overlay.classList).not.toContain('fullscreen');
      component.isFullscreen = true;
      fixture.detectChanges();
      expect(overlay.classList).toContain('fullscreen');
    });

    it('puts the whole page into fullscreen, so dialog and menu stay visible', () => {
      httpMock.expectOne('/api/me/').flush({});
      expect(component.fullscreenTarget()).toBe(document.documentElement);
    });

    it('does not start hls.js when the player closes during the session check', async () => {
      fixture.destroy();
      await sessionOk();
      expect(hls.attachMedia).not.toHaveBeenCalled();
      expect(hls.loadSource).not.toHaveBeenCalled();
    });

    it('creates hls.js only once when the resolution changes during loading', async () => {
      const switching = component.onResolutionChange('1080p');
      await sessionOk();
      await switching;
      expect(component.createHls).toHaveBeenCalledTimes(1);
      expect(hls.attachMedia).toHaveBeenCalledTimes(1);
    });

    it('destroys hls.js when the player closes', async () => {
      await sessionOk();
      fixture.destroy();
      expect(hls.destroy).toHaveBeenCalled();
    });
  });

  describe('after a failed conversion', () => {
    beforeEach(() => create({ ...TEST_VIDEO, status: 'failed', resolutions: [] }));

    it('says so instead of asking to wait', () => {
      httpMock.expectNone('/api/me/');
      expect(fixture.nativeElement.textContent).toContain('This video could not be converted');
      expect(fixture.nativeElement.textContent).not.toContain('still being processed');
    });
  });

  describe('without converted resolutions', () => {
    beforeEach(() => create({ ...TEST_VIDEO, resolutions: [] }));

    it('shows a friendly message instead of a video', () => {
      httpMock.expectNone('/api/me/');
      expect(videoElement()).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('This video is still being processed');
      expect(hls.loadSource).not.toHaveBeenCalled();
    });
  });
});
