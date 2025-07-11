import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoThumbnailComponent } from './video-thumbnail.component';

describe('VideoThumbnailComponent', () => {
  let component: VideoThumbnailComponent;
  let fixture: ComponentFixture<VideoThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoThumbnailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
