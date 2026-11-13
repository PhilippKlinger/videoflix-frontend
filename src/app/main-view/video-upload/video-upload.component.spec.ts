import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpEventType } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { VideoUploadComponent } from './video-upload.component';
import { provideAppHttpClient } from 'src/app/http.providers';
import { TEST_VIDEO } from 'src/app/testing/video.fixture';

describe('VideoUploadComponent', () => {
  let component: VideoUploadComponent;
  let fixture: ComponentFixture<VideoUploadComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const clip = new File(['x'], 'clip.mp4', { type: 'video/mp4' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VideoUploadComponent],
      providers: [provideAppHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(VideoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function fillForm(file: File = clip) {
    component.onFileChange({ target: { files: [file] } } as unknown as Event);
    component.uploadForm.patchValue({ title: 'My clip', description: 'A test clip', category: 'Action' });
  }

  function text(): string {
    fixture.detectChanges();
    return fixture.nativeElement.textContent;
  }

  it('sends title, description, category and file, but no genre', () => {
    fillForm();
    component.onSubmit();

    const req = httpMock.expectOne('/api/upload/');
    expect(req.request.method).toBe('POST');
    const formData = req.request.body as FormData;
    expect(formData.get('title')).toBe('My clip');
    expect(formData.get('description')).toBe('A test clip');
    expect(formData.get('category')).toBe('Action');
    expect(formData.get('video_file')).toBe(clip);
    expect(formData.has('genre')).toBe(false);
    req.flush(TEST_VIDEO, { status: 201, statusText: 'Created' });
  });

  it('shows the upload progress and returns to browse afterwards', () => {
    fillForm();
    component.onSubmit();

    const req = httpMock.expectOne('/api/upload/');
    req.event({ type: HttpEventType.UploadProgress, loaded: 40, total: 100 });
    expect(component.uploadProgress()).toBe(40);
    expect(text()).toContain('Uploading… 40 %');

    req.flush(TEST_VIDEO, { status: 201, statusText: 'Created' });
    expect(router.navigate).toHaveBeenCalledWith(['/browse']);
  });

  it('rejects a title or description longer than the backend allows', () => {
    fillForm();
    component.uploadForm.patchValue({ title: 'x'.repeat(151) });
    component.uploadForm.markAllAsTouched();
    component.onSubmit();
    httpMock.expectNone('/api/upload/');
    expect(text()).toContain('The title must not be longer than 150 characters.');

    component.uploadForm.patchValue({ title: 'My clip', description: 'x'.repeat(501) });
    component.onSubmit();
    httpMock.expectNone('/api/upload/');
    expect(text()).toContain('The description must not be longer than 500 characters.');
  });

  describe('file picker', () => {
    it('opens the hidden file input from a labelled button', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.file-button');
      expect(button.type).toBe('button');
      expect(button.textContent).toContain('Choose video');
      expect(input.hidden).toBe(true);
      const click = vi.spyOn(input, 'click').mockReturnValue(undefined);
      button.click();
      expect(click).toHaveBeenCalled();
    });

    it('shows the name of the chosen file', () => {
      expect(text()).toContain('No file chosen');
      component.onFileChange({ target: { files: [clip] } } as unknown as Event);
      expect(text()).toContain('clip.mp4');
    });
  });

  it('rejects a title that only consists of whitespace', () => {
    fillForm();
    component.uploadForm.patchValue({ title: '    ' });
    expect(component.uploadForm.controls.title.hasError('blank')).toBe(true);
    component.onSubmit();
    httpMock.expectNone('/api/upload/');
  });

  it('shows the backend message for a rejected title', () => {
    fillForm();
    component.onSubmit();
    httpMock.expectOne('/api/upload/').flush({ title: ['This field may not be blank.'] }, { status: 400, statusText: 'Bad Request' });
    expect(text()).toContain('This field may not be blank.');
    expect(text()).not.toContain('try again later');
  });

  it('shows a backend title error that arrives as a plain string', () => {
    fillForm();
    component.onSubmit();
    httpMock.expectOne('/api/upload/').flush({ title: 'Title is not allowed.' }, { status: 400, statusText: 'Bad Request' });
    expect(text()).toContain('Title is not allowed.');
  });

  it('shows the backend message for a resolution or frame rate that is too high', () => {
    for (const message of ['The video resolution is too large.', 'The frame rate must not be higher than 120 fps.']) {
      fillForm();
      component.onSubmit();
      httpMock.expectOne('/api/upload/').flush({ video_file: [message] }, { status: 400, statusText: 'Bad Request' });
      expect(text()).toContain(message);
    }
  });

  it('does not upload without a file', () => {
    component.uploadForm.patchValue({ title: 'My clip', description: 'A test clip', category: 'Action' });
    component.onSubmit();
    httpMock.expectNone('/api/upload/');
  });

  it('rejects files over 50 MB before uploading', () => {
    const big = new File(['x'], 'big.mp4', { type: 'video/mp4' });
    Object.defineProperty(big, 'size', { value: 50 * 1024 * 1024 + 1 });
    fillForm(big);
    component.onSubmit();

    httpMock.expectNone('/api/upload/');
    expect(text()).toContain('The file must not be larger than 50 MB.');
  });

  it('shows the reason for a rejected file', () => {
    fillForm();
    component.onSubmit();
    httpMock.expectOne('/api/upload/').flush({ video_file: ['The video must not be longer than 2 minutes.'] }, { status: 400, statusText: 'Bad Request' });
    expect(text()).toContain('The video must not be longer than 2 minutes.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('shows the upload limit message', () => {
    fillForm();
    component.onSubmit();
    httpMock.expectOne('/api/upload/').flush({ detail: 'Upload limit reached. Delete one of your videos first.' }, { status: 400, statusText: 'Bad Request' });
    expect(text()).toContain('Upload limit reached. Delete one of your videos first.');
  });

  it('asks to wait when uploads are throttled', () => {
    fillForm();
    component.onSubmit();
    httpMock.expectOne('/api/upload/').flush({ detail: 'Request was throttled. Expected available in 3599 seconds.' }, { status: 429, statusText: 'Too Many Requests' });
    expect(text()).toContain('You have uploaded a lot of videos recently. Please try again later.');
    expect(text()).not.toContain('3599');
  });

  it('shows a general message for other errors', () => {
    fillForm();
    component.onSubmit();
    httpMock.expectOne('/api/upload/').flush({}, { status: 500, statusText: 'Server Error' });
    expect(text()).toContain('The upload did not work. Please try again later.');
    expect(component.uploading()).toBe(false);
  });
});
