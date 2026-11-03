import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { BrowseComponent } from './browse.component';
import { MyVideosComponent } from '../my-videos/my-videos.component';
import { TEST_VIDEO } from 'src/app/testing/video.fixture';
import { provideAppHttpClient } from 'src/app/http.providers';
import { Role } from 'src/app/models/user.model';
import { Video } from 'src/app/models/video.model';

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

  afterEach(() => httpMock.verify());

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
    expect(query('.demo-banner')?.textContent).toContain('Demo account: it and your uploads are deleted automatically after 2 hours.');
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

  it('reloads the list when "My videos" reports a change', () => {
    create('member', [own]);
    const myVideos: MyVideosComponent = fixture.debugElement.query(By.directive(MyVideosComponent)).componentInstance;
    myVideos.changed.emit();
    httpMock.expectOne('/api/video/').flush([]);
    fixture.detectChanges();
    expect(component.ownVideos).toEqual([]);
  });
});
