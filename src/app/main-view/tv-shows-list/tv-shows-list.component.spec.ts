import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvShowsListComponent } from './tv-shows-list.component';

describe('TvShowsListComponent', () => {
  let component: TvShowsListComponent;
  let fixture: ComponentFixture<TvShowsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TvShowsListComponent]
    });
    fixture = TestBed.createComponent(TvShowsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
