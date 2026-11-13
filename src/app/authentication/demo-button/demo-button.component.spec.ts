import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { DemoButtonComponent } from './demo-button.component';
import { provideAppHttpClient } from 'src/app/http.providers';

describe('DemoButtonComponent', () => {
  let fixture: ComponentFixture<DemoButtonComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DemoButtonComponent],
      providers: [provideAppHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(DemoButtonComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  function clickAndFail(status: number, detail: string) {
    button().click();
    httpMock.expectOne('/api/demo/').flush({ detail }, { status, statusText: 'Error' });
    fixture.detectChanges();
  }

  it('starts a demo and opens browse', () => {
    button().click();
    httpMock.expectOne('/api/demo/').flush({ detail: 'demo started' }, { status: 201, statusText: 'Created' });
    httpMock.expectOne('/api/me/').flush({ id: 2, email: 'demo-1@demo.invalid', role: 'demo' });
    expect(router.navigate).toHaveBeenCalledWith(['/browse']);
  });

  it('cannot be clicked twice while the demo starts', () => {
    button().click();
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    httpMock.expectOne('/api/demo/').flush({}, { status: 201, statusText: 'Created' });
    httpMock.expectOne('/api/me/').flush({ id: 2, email: 'demo-1@demo.invalid', role: 'demo' });
  });

  it('says when all demo slots are in use', () => {
    clickAndFail(503, 'All demo slots are in use. Please try again later.');
    expect(fixture.nativeElement.textContent).toContain('All demo slots are in use. Please try again later.');
    expect(button().disabled).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('hides the technical throttle text', () => {
    clickAndFail(429, 'Request was throttled. Expected available in 3599 seconds.');
    expect(fixture.nativeElement.textContent).toContain('Too many demo starts. Please try again later.');
    expect(fixture.nativeElement.textContent).not.toContain('3599');
  });

  it('shows a general message for other errors', () => {
    clickAndFail(500, 'Internal Server Error');
    expect(fixture.nativeElement.textContent).toContain('The demo could not be started. Please try again later.');
  });
});
