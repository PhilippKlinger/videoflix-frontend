import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TEST_VIDEO } from '../testing/video.fixture';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Video } from '../models/video.model';

import { VideoPlayerComponent } from './video-player.component';

describe('VideoPlayerComponent', () => {
  let component: VideoPlayerComponent;
  let fixture: ComponentFixture<VideoPlayerComponent>;

  const videoWithResolutions: Video = {
    ...TEST_VIDEO,
    resolutions: [
      { id: 1, original_video: 1, resolution: '720p', converted_file: '/media/v/720p.mp4' },
      { id: 2, original_video: 1, resolution: '1080p', converted_file: '/media/v/1080p.mp4' },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VideoPlayerComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { video: videoWithResolutions } }]
    });
    fixture = TestBed.createComponent(VideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sorts resolutions descending', () => {
    expect(component.video.resolutions.map(r => r.resolution)).toEqual(['1080p', '720p']);
  });

  it('uses the original file for 2160p', () => {
    expect(component.videoUrl).toMatch(/\/media\/videos\/test\.mp4$/);
  });

  it('switches to the converted file of the chosen resolution', () => {
    component.onResolutionChange('720p');
    expect(component.selectedResolution).toBe('720p');
    expect(component.videoUrl).toMatch(/\/media\/v\/720p\.mp4$/);
  });

  it('renders a native video element with controls', () => {
    const video: HTMLVideoElement | null = fixture.nativeElement.querySelector('video');
    expect(video?.hasAttribute('controls')).toBeTrue();
  });

  it('renders no videogular elements', () => {
    expect(fixture.nativeElement.querySelector('vg-player')).toBeNull();
  });
});
