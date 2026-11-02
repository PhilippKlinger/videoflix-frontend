import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { BrowseComponent } from './browse.component';
import { TEST_VIDEO } from 'src/app/testing/video.fixture';

describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('groups videos by category', () => {
    TestBed.inject(HttpTestingController).expectOne('/api/video/').flush([
      { ...TEST_VIDEO, id: 1, category: 'Comedy' },
      { ...TEST_VIDEO, id: 2, category: 'Action' },
      { ...TEST_VIDEO, id: 3, category: 'Action' },
    ]);
    fixture.detectChanges();
    expect(component.genreOrder).toEqual(['Action', 'Comedy']);
    expect(component.genreMap['Action'].map(v => v.id)).toEqual([2, 3]);
  });
});
