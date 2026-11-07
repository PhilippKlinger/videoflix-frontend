import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_VIDEO } from '../../testing/video.fixture';

import { VideoThumbnailComponent } from './video-thumbnail.component';

describe('VideoThumbnailComponent', () => {
  let component: VideoThumbnailComponent;
  let fixture: ComponentFixture<VideoThumbnailComponent>;

  function create(overrides: Partial<typeof TEST_VIDEO> = {}) {
    fixture = TestBed.createComponent(VideoThumbnailComponent);
    component = fixture.componentInstance;
    component.video = { ...TEST_VIDEO, ...overrides };
    fixture.detectChanges();
  }

  const root = (): HTMLElement => fixture.nativeElement.firstElementChild;

  beforeEach(() => TestBed.configureTestingModule({ imports: [VideoThumbnailComponent] }));

  it('is a button named after the video', () => {
    create({ title: 'Mountain run' });
    expect(root().tagName).toBe('BUTTON');
    expect(root().getAttribute('type')).toBe('button');
    // No aria-label: the visible text names the button, and the image adds nothing.
    expect(root().hasAttribute('aria-label')).toBeFalse();
    expect(root().querySelector('img')?.getAttribute('alt')).toBe('');
    expect(root().textContent).toContain('Mountain run');
  });

  it('emits open on click', () => {
    create();
    const opened: unknown[] = [];
    component.open.subscribe(video => opened.push(video));
    // The keyboard path is covered by the e2e test "tile opens details with the keyboard".
    root().click();
    expect(opened).toEqual([component.video]);
  });

  it('shows title and category', () => {
    create({ title: 'Mountain run', category: 'Sports' });
    expect(root().textContent).toContain('Mountain run');
    expect(root().textContent).toContain('Sports');
  });

  it('shows the private badge only for private videos', () => {
    create({ visibility: 'public' });
    expect(root().querySelector('.badge')).toBeNull();
    create({ visibility: 'private' });
    expect(root().querySelector('.badge')?.textContent).toContain('Private');
  });

  it('shows a placeholder instead of a broken image without a thumbnail', () => {
    create({ thumbnail_url: null });
    expect(root().querySelector('img')).toBeNull();
    expect(root().querySelector('.placeholder')).not.toBeNull();
  });
});
