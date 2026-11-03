import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { of } from 'rxjs';
import { VideoUploadComponent } from './video-upload.component';
import { ApiService } from 'src/app/services/api.service';

describe('VideoUploadComponent', () => {
  let component: VideoUploadComponent;
  let fixture: ComponentFixture<VideoUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VideoUploadComponent],
      imports: [ReactiveFormsModule],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(VideoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends category but no genre', () => {
    const addSpy = spyOn(TestBed.inject(ApiService), 'addVideo').and.returnValue(of(undefined));
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    component.selectedFile = file;
    component.uploadForm.patchValue({ title: 'My clip', description: 'A test clip', category: 'Action', videoFile: file });

    component.onSubmit();

    const formData = addSpy.calls.mostRecent().args[0] as FormData;
    expect(formData.get('category')).toBe('Action');
    expect(formData.has('genre')).toBeFalse();
  });
});
