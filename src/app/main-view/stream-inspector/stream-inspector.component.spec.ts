import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StreamInspectorComponent } from './stream-inspector.component';
import { UnderTheHoodService } from 'src/app/services/under-the-hood.service';
import { StreamStats } from 'src/app/models/video.model';

const STREAM: StreamStats = {
  resolution: '720p', bitrate_kbps: 1300, segment_count: 26, segment_seconds: 4, duration_seconds: 103.4, size_bytes: 17000000,
};
const URL = '/api/video/7/streams/';

describe('StreamInspectorComponent', () => {
  let fixture: ComponentFixture<StreamInspectorComponent>;
  let http: HttpTestingController;
  let hood: UnderTheHoodService;

  beforeEach(() => {
    localStorage.removeItem('videoflix.underTheHood');
    TestBed.configureTestingModule({
      imports: [StreamInspectorComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    hood = TestBed.inject(UnderTheHoodService);
    fixture = TestBed.createComponent(StreamInspectorComponent);
    fixture.componentRef.setInput('videoId', 7);
  });

  afterEach(() => localStorage.removeItem('videoflix.underTheHood'));

  function turnOn(): void {
    hood.toggle();
    fixture.detectChanges();
  }

  function respond(streams: StreamStats[]): void {
    turnOn();
    http.expectOne(URL).flush({ streams });
    fixture.detectChanges();
  }

  function cells(): string[] {
    return [...fixture.nativeElement.querySelectorAll('tbody tr:first-child td')].map((c: any) => c.textContent.trim());
  }

  it('requests streams only when enabled', () => {
    fixture.detectChanges();
    http.expectNone(URL);
    expect(fixture.nativeElement.textContent.trim()).toBe('');
    turnOn();
    http.expectOne(URL).flush({ streams: [] });
  });

  it('follows the switch without requesting again', () => {
    respond([STREAM]);
    hood.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    hood.toggle();
    fixture.detectChanges();
    http.expectNone(URL);
    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
  });

  it('formats a row as 720p, 1.3 Mbit/s, 26 × 4 s, 17 MB', () => {
    respond([STREAM]);
    expect(cells()).toEqual(['720p', '1.3 Mbit/s', '26 × 4 s', '17 MB']);
  });

  it('shows 16 s for old uploads', () => {
    respond([{ ...STREAM, segment_count: 7, segment_seconds: 16 }]);
    expect(cells()[2]).toBe('7 × 16 s');
  });

  it('has a real table with column headers', () => {
    respond([STREAM]);
    const headers = [...fixture.nativeElement.querySelectorAll('th[scope="col"]')].map((h: any) => h.textContent.trim());
    expect(headers).toEqual(['Resolution', 'Bitrate', 'Segments', 'Size']);
  });

  it('keeps a scrollable table reachable by keyboard', () => {
    respond([STREAM]);
    const wrap = fixture.nativeElement.querySelector('.table-wrap');
    expect(wrap.getAttribute('tabindex')).toBe('0');
    expect(wrap.getAttribute('role')).toBe('region');
    expect(wrap.getAttribute('aria-label')).toBe('Stream statistics');
  });

  it('empty list shows "Stream details are not available yet."', () => {
    respond([]);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Stream details are not available yet.');
  });

  it('http error shows "Stream details could not be loaded." and logs the error', () => {
    const log = vi.spyOn(console, 'error').mockReturnValue(undefined);
    turnOn();
    http.expectOne(URL).flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Stream details could not be loaded.');
    expect(fixture.nativeElement.textContent).not.toContain('500');
    expect(log).toHaveBeenCalled();
  });

  it('shows the path Upload → ffprobe → ffmpeg → HLS → Player', () => {
    respond([]);
    expect(fixture.nativeElement.textContent).toContain('Upload → ffprobe → ffmpeg → HLS → Player');
  });

  it('reserves room for three rows, so the dialog does not jump when the data arrives', () => {
    turnOn();
    const body: HTMLElement = fixture.nativeElement.querySelector('.body');
    const loading = body.offsetHeight;
    http.expectOne(URL).flush({
      streams: ['1080p', '720p', '480p'].map(resolution => ({ ...STREAM, resolution })),
    });
    fixture.detectChanges();
    expect(body.querySelectorAll('tbody tr').length).toBe(3);
    expect(body.offsetHeight).toBe(loading);
  });
});
