import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { MyVideosComponent, POLL_INTERVAL_MS } from './my-videos.component';
import { provideAppHttpClient } from 'src/app/http.providers';
import { TEST_VIDEO } from 'src/app/testing/video.fixture';
import { Video } from 'src/app/models/video.model';

describe('MyVideosComponent', () => {
  let fixture: ComponentFixture<MyVideosComponent>;
  let component: MyVideosComponent;
  let httpMock: HttpTestingController;

  const ready: Video = { ...TEST_VIDEO, id: 1, title: 'Ready clip', is_own: true, visibility: 'private', status: 'ready' };
  const converting: Video = { ...TEST_VIDEO, id: 2, title: 'New clip', is_own: true, visibility: 'private', status: 'processing', conversion_progress: 0 };
  const failed: Video = { ...TEST_VIDEO, id: 3, title: 'Broken clip', is_own: true, visibility: 'private', status: 'failed' };

  function create(videos: Video[]) {
    TestBed.configureTestingModule({
      imports: [MyVideosComponent],
      providers: [provideAppHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MyVideosComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('videos', videos);
    fixture.detectChanges();
  }

  function text(): string {
    fixture.detectChanges();
    return fixture.nativeElement.textContent;
  }

  function query<T extends HTMLElement>(selector: string): T | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function buttonWithText(label: string): HTMLButtonElement | undefined {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    return buttons.find(b => b.textContent?.includes(label));
  }

  afterEach(() => httpMock.verify());

  describe('quota', () => {
    it('links to the upload page while a slot is free', () => {
      create([ready]);
      expect(text()).toContain('1 of 2 used');
      expect(query<HTMLAnchorElement>('a.upload-tile')?.getAttribute('href')).toBe('/upload');
    });

    it('explains how to free a slot when both are used', () => {
      create([ready, failed]);
      expect(text()).toContain('2 of 2 used');
      expect(query('a.upload-tile')).toBeNull();
      expect(text()).toContain('Delete a video to upload a new one.');
    });
  });

  describe('status', () => {
    it('loads thumbnails lazily with a fixed size', () => {
      create([ready]);
      const img = query<HTMLImageElement>('button.play-tile img');
      expect(img?.getAttribute('loading')).toBe('lazy');
      expect(img?.getAttribute('width')).toBeTruthy();
      expect(img?.getAttribute('height')).toBeTruthy();
    });

    it('plays a ready video', () => {
      create([ready]);
      const played: Video[] = [];
      component.play.subscribe(v => played.push(v));
      query<HTMLButtonElement>('button.play-tile')?.click();
      expect(played).toEqual([ready]);
    });

    it('tells when the conversion failed', () => {
      create([failed]);
      expect(text()).toContain('Conversion failed. Delete the video and try again.');
      expect(query('button.play-tile')).toBeNull();
    });

    it('polls the progress while converting and reloads when it is done', fakeAsync(() => {
      create([converting]);
      expect(text()).toContain('Converting… 0 %');
      let changed = 0;
      component.changed.subscribe(() => changed++);

      tick(POLL_INTERVAL_MS);
      httpMock.expectOne('/api/conversion-progress/2/').flush({ progress: 40, current_resolution: '480p', status: 'processing' });
      expect(text()).toContain('Converting… 40 %');
      expect(changed).toBe(0);

      tick(POLL_INTERVAL_MS);
      httpMock.expectOne('/api/conversion-progress/2/').flush({ progress: 33, current_resolution: '720p', status: 'ready' });
      expect(changed).toBe(1);

      // Until the reloaded list arrives, no further polls and no further reloads.
      tick(POLL_INTERVAL_MS);
      httpMock.expectNone('/api/conversion-progress/2/');
      expect(changed).toBe(1);

      // The reloaded list replaces the input; once all resolutions exist the polling stops.
      fixture.componentRef.setInput('videos', [{ ...converting, status: 'ready', conversion_progress: 100 }]);
      fixture.detectChanges();
      tick(POLL_INTERVAL_MS * 2);
      httpMock.expectNone('/api/conversion-progress/2/');
    }));

    it('shows that more resolutions are converted after the first one is playable', fakeAsync(() => {
      const playable: Video = { ...converting, status: 'ready', conversion_progress: 33 };
      create([playable]);
      expect(query('button.play-tile')).not.toBeNull();
      expect(text()).toContain('More resolutions… 33 %');
      let changed = 0;
      component.changed.subscribe(() => changed++);

      tick(POLL_INTERVAL_MS);
      httpMock.expectOne('/api/conversion-progress/2/').flush({ progress: 66, current_resolution: '720p', status: 'ready' });
      expect(text()).toContain('More resolutions… 66 %');
      expect(changed).toBe(0);

      tick(POLL_INTERVAL_MS);
      httpMock.expectOne('/api/conversion-progress/2/').flush({ progress: 100, current_resolution: '1080p', status: 'ready' });
      expect(changed).toBe(1);

      fixture.componentRef.setInput('videos', [{ ...playable, conversion_progress: 100 }]);
      expect(text()).not.toContain('More resolutions');
      tick(POLL_INTERVAL_MS * 2);
      httpMock.expectNone('/api/conversion-progress/2/');
    }));

    it('waits for a slow progress answer instead of dropping it', fakeAsync(() => {
      create([converting]);
      tick(POLL_INTERVAL_MS);
      const slow = httpMock.expectOne('/api/conversion-progress/2/');

      tick(POLL_INTERVAL_MS);
      httpMock.expectNone('/api/conversion-progress/2/');
      expect(slow.cancelled).toBeFalse();

      slow.flush({ progress: 40, current_resolution: '480p', status: 'processing' });
      expect(text()).toContain('Converting… 40 %');
      // Still converting, so the polling goes on until the page closes.
      fixture.destroy();
      discardPeriodicTasks();
    }));

    it('keeps the progress of the others when one video is gone', fakeAsync(() => {
      const other: Video = { ...converting, id: 4, title: 'Other clip' };
      create([converting, other]);
      let changed = 0;
      component.changed.subscribe(() => changed++);

      tick(POLL_INTERVAL_MS);
      httpMock.expectOne('/api/conversion-progress/2/').flush({ progress: 40, current_resolution: '480p', status: 'processing' });
      httpMock.expectOne('/api/conversion-progress/4/').flush({ detail: 'Not found.' }, { status: 404, statusText: 'Not Found' });

      expect(text()).toContain('Converting… 40 %');
      expect(changed).toBe(1);
      tick(POLL_INTERVAL_MS);
      httpMock.expectNone(() => true);
    }));

    it('does not poll without converting videos', fakeAsync(() => {
      create([ready, failed]);
      tick(POLL_INTERVAL_MS * 2);
      httpMock.expectNone(() => true);
    }));

    it('stops polling when the page closes', fakeAsync(() => {
      create([converting]);
      fixture.destroy();
      tick(POLL_INTERVAL_MS * 2);
      httpMock.expectNone('/api/conversion-progress/2/');
      discardPeriodicTasks();
    }));
  });

  describe('delete', () => {
    it('keeps a second running delete blocked when the first one finishes', () => {
      const other: Video = { ...ready, id: 4, title: 'Other clip' };
      create([ready, other]);
      component.askDelete(ready);
      component.delete(ready);
      component.askDelete(other);
      component.delete(other);
      httpMock.expectOne('/api/video/1/').flush(null);
      fixture.detectChanges();
      expect(query<HTMLButtonElement>('.confirm-delete')?.disabled).toBeTrue();
      httpMock.expectOne('/api/video/4/').flush(null);
      fixture.detectChanges();
      expect(query('.confirm-delete')).toBeNull();
    });

    it('asks before deleting and can be kept', () => {
      create([ready]);
      buttonWithText('Delete')?.click();
      expect(text()).toContain('Delete this video?');
      buttonWithText('Keep')?.click();
      expect(text()).not.toContain('Delete this video?');
      httpMock.expectNone('/api/video/1/');
    });

    it('moves the keyboard focus to "Keep" and back to "Delete"', () => {
      create([ready]);
      buttonWithText('Delete')?.click();
      fixture.detectChanges();
      expect(document.activeElement).toBe(buttonWithText('Keep')!);

      buttonWithText('Keep')?.click();
      fixture.detectChanges();
      expect(document.activeElement).toBe(query('button.delete-btn'));
    });

    it('deletes after the confirmation and reloads', () => {
      create([ready]);
      let changed = 0;
      component.changed.subscribe(() => changed++);
      buttonWithText('Delete')?.click();
      fixture.detectChanges();
      query<HTMLButtonElement>('button.confirm-delete')?.click();

      const req = httpMock.expectOne('/api/video/1/');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
      expect(changed).toBe(1);
    });

    it('shows a friendly message when deleting fails and reloads', () => {
      create([ready]);
      let changed = 0;
      component.changed.subscribe(() => changed++);
      buttonWithText('Delete')?.click();
      fixture.detectChanges();
      query<HTMLButtonElement>('button.confirm-delete')?.click();
      httpMock.expectOne('/api/video/1/').flush({ detail: 'Not found.' }, { status: 404, statusText: 'Not Found' });

      expect(text()).toContain('The video could not be deleted. The list has been refreshed.');
      expect(text()).not.toContain('Not found.');
      expect(changed).toBe(1);
    });
  });
});
