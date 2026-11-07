import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TEST_VIDEO } from 'src/app/testing/video.fixture';
import { Video } from 'src/app/models/video.model';

import { VideoDetailsComponent } from './video-details.component';

describe('VideoDetailsComponent', () => {
  let fixture: ComponentFixture<VideoDetailsComponent>;
  let close: jasmine.Spy;

  function create(video: Video = TEST_VIDEO) {
    close = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      imports: [VideoDetailsComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: { video } },
      ],
    });
    fixture = TestBed.createComponent(VideoDetailsComponent);
    fixture.detectChanges();
  }

  function query<T extends HTMLElement>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  it('shows title, description and category', () => {
    create();
    expect(query('h2').textContent).toContain('Test video');
    expect(fixture.nativeElement.textContent).toContain('Test description');
    expect(fixture.nativeElement.textContent).toContain('Action');
  });

  it('play closes with "play"', () => {
    create();
    query('.play').click();
    expect(close).toHaveBeenCalledOnceWith('play');
  });

  it('has a labelled close button that closes without a value', () => {
    create();
    const button = query('.close');
    expect(button.getAttribute('aria-label')).toBe('Close details');
    button.click();
    expect(close).toHaveBeenCalledOnceWith();
  });

  it('shows a calm placeholder instead of a broken image without thumbnail', () => {
    create({ ...TEST_VIDEO, thumbnail_url: null });
    expect(query('img')).toBeNull();
    expect(query('.placeholder')).not.toBeNull();
  });

  it('shows the thumbnail when there is one', () => {
    create();
    expect(query('img').getAttribute('src')).toBe(TEST_VIDEO.thumbnail_url);
    expect(query('.placeholder')).toBeNull();
  });

  it('has an inspector for this video that stays empty while the switch is off', () => {
    create();
    expect(query('app-stream-inspector')).not.toBeNull();
    expect(query('app-stream-inspector').textContent?.trim()).toBe('');
  });
});
