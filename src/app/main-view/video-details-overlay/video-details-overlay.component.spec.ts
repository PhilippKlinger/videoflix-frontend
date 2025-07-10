import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoDetailsOverlayComponent } from './video-details-overlay.component';

describe('VideoDetailsOverlayComponent', () => {
  let component: VideoDetailsOverlayComponent;
  let fixture: ComponentFixture<VideoDetailsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoDetailsOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoDetailsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
