import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { config } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { BrowseComponent } from './browse.component';
import { MyVideosComponent } from '../my-videos/my-videos.component';
import { TEST_VIDEO } from 'src/app/testing/video.fixture';
import { provideAppHttpClient } from 'src/app/http.providers';
import { Role } from 'src/app/models/user.model';
import { Video } from 'src/app/models/video.model';
import { UnderTheHoodService } from 'src/app/services/under-the-hood.service';
import { VideoDetailsComponent } from '../video-details/video-details.component';
import { VideoPlayerComponent } from 'src/app/video-player/video-player.component';

describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;
  let httpMock: HttpTestingController;

  const own: Video = { ...TEST_VIDEO, id: 10, title: 'My upload', is_own: true, visibility: 'private' };

  function create(role: Role, videos: Video[]) {
    TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [provideAppHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne('/api/me/').flush({ id: 1, email: 'a@b.de', role });
    httpMock.expectOne('/api/video/').flush(videos);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  beforeEach(() => localStorage.removeItem('videoflix.underTheHood'));

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('videoflix.underTheHood');
  });

  it('loads the hero image first and catalog tiles only when they scroll into view', () => {
    create('member', [{ ...TEST_VIDEO, id: 1 }, { ...TEST_VIDEO, id: 2 }]);
    const hero = query('img.hero-bg');
    expect(hero?.getAttribute('fetchpriority')).toBe('high');
    expect(hero?.getAttribute('loading')).toBeNull();
    const tiles: HTMLImageElement[] = Array.from(fixture.nativeElement.querySelectorAll('.video_list img'));
    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) {
      expect(tile.getAttribute('loading')).toBe('lazy');
      expect(tile.getAttribute('width')).toBeTruthy();
      expect(tile.getAttribute('height')).toBeTruthy();
    }
  });

  it('renders every catalog tile as a button and a video without thumbnail without a broken hero image', () => {
    create('member', [{ ...TEST_VIDEO, id: 1, thumbnail_url: null }]);
    expect(query('img.hero-bg')).toBeNull();
    expect(query('.hero')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.video_list app-video-thumbnail > button').length).toBe(2);
  });

  it('hero tech line only when enabled', () => {
    const resolutions = ['1080p', '480p'].map((resolution, id) => ({ id, original_video: 1, resolution }));
    create('member', [{ ...TEST_VIDEO, id: 1, resolutions }]);
    expect(query('.hero .tech')).toBeNull();

    TestBed.inject(UnderTheHoodService).toggle();
    fixture.detectChanges();
    httpMock.expectOne('/version.json').flush({ sha: '133f300', builtAt: 'x' });
    expect(query('.hero .tech')?.textContent?.trim()).toBe('HLS · 480p 1080p · H.264 · AAC');
  });

  it('features the newest catalog video and lists the newest first', () => {
    create('member', [
      { ...TEST_VIDEO, id: 1, created_at: '2026-01-01T00:00:00Z' },
      { ...TEST_VIDEO, id: 2, created_at: '2026-03-01T00:00:00Z' },
      { ...TEST_VIDEO, id: 3, created_at: '2026-02-01T00:00:00Z' },
    ]);
    expect(component.newestVideos.map(v => v.id)).toEqual([2, 3, 1]);
    expect(component.featured?.id).toBe(2);
  });

  it('groups videos by category', () => {
    create('member', [
      { ...TEST_VIDEO, id: 1, category: 'Comedy' },
      { ...TEST_VIDEO, id: 2, category: 'Action' },
      { ...TEST_VIDEO, id: 3, category: 'Action' },
    ]);
    expect(component.genreOrder).toEqual(['Action', 'Comedy']);
    expect(component.genreMap['Action'].map(v => v.id)).toEqual([2, 3]);
  });

  it('shows own uploads only in "My videos", not in the catalog', () => {
    create('member', [own, { ...TEST_VIDEO, id: 1 }]);
    expect(component.ownVideos.map(v => v.id)).toEqual([10]);
    expect(component.newestVideos.map(v => v.id)).toEqual([1]);
    expect(component.genreMap['Action'].map(v => v.id)).toEqual([1]);
    expect(component.featured?.id).toBe(1);
  });

  it('offers "My videos" to members even without uploads', () => {
    create('member', [{ ...TEST_VIDEO, id: 1 }]);
    expect(query('app-my-videos')).not.toBeNull();
  });

  it('has no "My videos" row for admins, whose uploads are standard videos', () => {
    create('admin', [{ ...TEST_VIDEO, id: 1 }]);
    expect(query('app-my-videos')).toBeNull();
  });

  it('marks private uploads of others in the catalog for admins', () => {
    create('admin', [{ ...TEST_VIDEO, id: 1, visibility: 'private', is_own: false }, { ...TEST_VIDEO, id: 2 }]);
    // Video 1 appears in "New on Videoflix" and in its genre row.
    expect(fixture.nativeElement.querySelectorAll('.video_list .badge').length).toBe(2);
  });

  it('tells demo accounts when they are deleted', () => {
    create('demo', []);
    expect(query('.demo-banner')?.textContent).toContain('Demo account: this account and your uploads are deleted automatically after 2 hours.');
  });

  it('shows no demo banner for members', () => {
    create('member', []);
    expect(query('.demo-banner')).toBeNull();
  });

  it('stops loading and shows a message when there are no videos', () => {
    create('demo', []);
    expect(component.loading).toBeFalse();
    expect(query('.no_videos')).not.toBeNull();
    expect(query('app-my-videos')).not.toBeNull();
  });

  it('shows a loading text until the first answer arrives', () => {
    TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [provideAppHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BrowseComponent);
    fixture.detectChanges();
    expect(query('.state-message')?.textContent).toContain('Loading videos…');
    httpMock.expectOne('/api/me/').flush({ id: 1, email: 'a@b.de', role: 'member' });
    httpMock.expectOne('/api/video/').flush([]);
    fixture.detectChanges();
    expect(query('.state-message.loading')).toBeNull();
  });

  it('tells in plain words when the videos cannot be loaded, and offers a retry', () => {
    spyOn(console, 'error');
    TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [provideAppHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BrowseComponent);
    fixture.detectChanges();
    httpMock.expectOne('/api/me/').flush({ id: 1, email: 'a@b.de', role: 'member' });
    httpMock.expectOne('/api/video/').flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(query('.state-message.error')?.textContent).toContain('The videos could not be loaded.');
    expect(query('.no_videos')).toBeNull();

    query('.state-message.error button')?.click();
    httpMock.expectOne('/api/video/').flush([]);
  });

  it('still shows the catalog when the account cannot be loaded', fakeAsync(() => {
    const unhandled = jasmine.createSpy('onUnhandledError');
    const previous = config.onUnhandledError;
    config.onUnhandledError = unhandled;
    spyOn(console, 'error');
    try {
      TestBed.configureTestingModule({
        imports: [BrowseComponent],
        providers: [provideAppHttpClient(), provideHttpClientTesting(), provideRouter([])]
      });
      httpMock = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(BrowseComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      httpMock.expectOne('/api/me/').flush({}, { status: 500, statusText: 'Server Error' });
      httpMock.expectOne('/api/video/').flush([{ ...TEST_VIDEO, id: 1 }]);
      fixture.detectChanges();
      // RxJS reports unhandled errors asynchronously.
      flush();

      expect(unhandled).not.toHaveBeenCalled();
      expect(component.newestVideos.map(v => v.id)).toEqual([1]);
      expect(query('app-my-videos')).toBeNull();
    } finally {
      config.onUnhandledError = previous;
    }
  }));

  it('reloads the list when "My videos" reports a change', () => {
    create('member', [own]);
    const myVideos: MyVideosComponent = fixture.debugElement.query(By.directive(MyVideosComponent)).componentInstance;
    myVideos.changed.emit();
    httpMock.expectOne('/api/video/').flush([]);
    fixture.detectChanges();
    expect(component.ownVideos).toEqual([]);
  });

  describe('opening a video', () => {
    let open: jasmine.Spy;

    function afterClosing(result: string | undefined) {
      open = spyOn(component.dialog, 'open').and.returnValue({ afterClosed: () => of(result) } as never);
    }

    it('opening a tile opens details', () => {
      create('member', [{ ...TEST_VIDEO, id: 1 }]);
      afterClosing(undefined);
      fixture.nativeElement.querySelector('.video_list app-video-thumbnail > button').click();
      expect(open).toHaveBeenCalledTimes(1);
      expect(open.calls.mostRecent().args[0]).toBe(VideoDetailsComponent);
      expect(open.calls.mostRecent().args[1].data).toEqual({ video: component.newestVideos[0] });
      expect(open.calls.mostRecent().args[1].restoreFocus).toBeTrue();
    });

    it('opens the player after "play" in the details', () => {
      create('member', [{ ...TEST_VIDEO, id: 1 }]);
      afterClosing('play');
      component.openDetails(TEST_VIDEO);
      expect(open).toHaveBeenCalledTimes(2);
      expect(open.calls.mostRecent().args[0]).toBe(VideoPlayerComponent);
    });

    it('stays on the page when the details close without "play"', () => {
      create('member', [{ ...TEST_VIDEO, id: 1 }]);
      afterClosing(undefined);
      component.openDetails(TEST_VIDEO);
      expect(open).toHaveBeenCalledTimes(1);
    });

    it('hero play goes directly to the player', () => {
      create('member', [{ ...TEST_VIDEO, id: 1 }]);
      afterClosing(undefined);
      query('.hero-play')!.click();
      expect(open).toHaveBeenCalledTimes(1);
      expect(open.calls.mostRecent().args[0]).toBe(VideoPlayerComponent);
    });
  });
});
