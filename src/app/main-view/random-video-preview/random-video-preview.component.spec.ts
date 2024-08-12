import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomVideoPreviewComponent } from './random-video-preview.component';

describe('RandomVideoPreviewComponent', () => {
  let component: RandomVideoPreviewComponent;
  let fixture: ComponentFixture<RandomVideoPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RandomVideoPreviewComponent]
    });
    fixture = TestBed.createComponent(RandomVideoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
