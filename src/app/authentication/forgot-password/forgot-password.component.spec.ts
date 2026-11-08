import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { ApiService } from 'src/app/services/api.service';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uses an email keyboard and no auto-capitalisation on the email field', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[matInput]');
    expect(input.type).toBe('email');
    expect(input.getAttribute('autocapitalize')).toBe('off');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const failures: [number, string][] = [
    [400, 'Please check the email address and try again.'],
    [429, 'Could not send reset instructions. Please try again in a moment.'],
    [500, 'Could not send reset instructions. Please try again in a moment.'],
    [0, 'Could not send reset instructions. Please try again in a moment.'],
  ];
  failures.forEach(([status, text]) => {
    it('shows the right message for status ' + status, () => {
      const error = new HttpErrorResponse({ status, error: {} });
      spyOn(TestBed.inject(ApiService), 'forgotPassword').and.returnValue(throwError(() => error));
      component.forgotForm.setValue({ email: 'a@b.de' });

      component.onSubmit();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(text);
    });
  });
});
