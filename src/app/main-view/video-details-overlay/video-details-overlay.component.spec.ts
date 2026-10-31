import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TEST_VIDEO } from '../../testing/video.fixture';

import { VideoDetailsOverlayComponent } from './video-details-overlay.component';

describe('VideoDetailsOverlayComponent', () => {
  let component: VideoDetailsOverlayComponent;
  let fixture: ComponentFixture<VideoDetailsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoDetailsOverlayComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoDetailsOverlayComponent);
    component = fixture.componentInstance;
    component.video = TEST_VIDEO;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
