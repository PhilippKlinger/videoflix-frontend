import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TEST_VIDEO } from '../../testing/video.fixture';

import { VideoThumbnailComponent } from './video-thumbnail.component';

describe('VideoThumbnailComponent', () => {
  let component: VideoThumbnailComponent;
  let fixture: ComponentFixture<VideoThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoThumbnailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoThumbnailComponent);
    component = fixture.componentInstance;
    component.video = TEST_VIDEO;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
