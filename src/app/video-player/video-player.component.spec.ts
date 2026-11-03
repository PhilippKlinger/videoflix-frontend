import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Hls from 'hls.js';
import { TEST_VIDEO } from '../testing/video.fixture';
import { Video } from '../models/video.model';

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
  let hls: jasmine.SpyObj<Hls>;

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
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { video } },
      ],
    });
    fixture = TestBed.createComponent(VideoPlayerComponent);
    component = fixture.componentInstance;
    // hls.js is a third-party library; the browser's own video element stays real.
    hls = jasmine.createSpyObj<Hls>('Hls', ['loadSource', 'attachMedia', 'destroy']);
    spyOn(component, 'createHls').and.returnValue(hls);
    fixture.detectChanges();
  }

  function videoElement(): HTMLVideoElement {
    return fixture.nativeElement.querySelector('video');
  }

  describe('with converted resolutions', () => {
    beforeEach(() => create(converted));

    it('loads the 720p playlist from the API', () => {
      expect(component.selectedResolution).toBe('720p');
      expect(hls.loadSource).toHaveBeenCalledWith('/api/video/1/720p/index.m3u8');
      expect(hls.attachMedia).toHaveBeenCalledWith(videoElement());
    });

    it('offers only the converted resolutions, highest first', () => {
      expect(component.resolutions).toEqual(['1080p', '720p', '480p']);
    });

    it('switches the playlist and keeps the position', () => {
      // Without loaded media the element keeps this as its start position (HTML spec).
      videoElement().currentTime = 12;
      component.onResolutionChange('1080p');
      expect(hls.loadSource).toHaveBeenCalledWith('/api/video/1/1080p/index.m3u8');
      expect(component.selectedResolution).toBe('1080p');
      expect(component.resumeAt).toBe(12);
    });

    it('jumps back to the position once the new playlist is loaded', () => {
      component.resumeAt = 12;
      videoElement().dispatchEvent(new Event('loadedmetadata'));
      expect(videoElement().currentTime).toBe(12);
      expect(component.resumeAt).toBeNull();
    });

    it('shows the thumbnail as poster', () => {
      expect(videoElement().getAttribute('poster')).toBe(TEST_VIDEO.thumbnail_url);
    });

    it('hides the native fullscreen button and offers its own', () => {
      expect(videoElement().getAttribute('controlslist')).toContain('nofullscreen');
      const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button[aria-label="Fullscreen"]');
      expect(button).not.toBeNull();
    });

    it('destroys hls.js when the player closes', () => {
      fixture.destroy();
      expect(hls.destroy).toHaveBeenCalled();
    });
  });

  describe('without converted resolutions', () => {
    beforeEach(() => create({ ...TEST_VIDEO, resolutions: [] }));

    it('shows a friendly message instead of a video', () => {
      expect(videoElement()).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('This video is still being processed');
      expect(hls.loadSource).not.toHaveBeenCalled();
    });
  });
});
