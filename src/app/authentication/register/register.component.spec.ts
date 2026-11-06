import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { ApiService } from 'src/app/services/api.service';
import { PASSWORD_HINT } from '../password-rules';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])]
    });
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends email, password and confirmed_password', () => {
    const registerSpy = spyOn(TestBed.inject(ApiService), 'registerUser').and.returnValue(of({}));
    component.registerForm.patchValue({ username: 'a@b.de', password: 'secret12', password_confirm: 'secret12' });

    component.onSubmit();

    expect(registerSpy).toHaveBeenCalledWith({ email: 'a@b.de', password: 'secret12', confirmed_password: 'secret12' });
  });

  it('password with 7 characters is invalid, with 8 valid', () => {
    const password = component.registerForm.get('password')!;
    password.setValue('abcdefg1');
    expect(password.valid).toBeTrue();
    password.setValue('abcdef1');
    expect(password.valid).toBeFalse();
  });

  it('shows PASSWORD_HINT at the field', () => {
    const hint = fixture.nativeElement.querySelector('mat-hint');
    expect(hint?.textContent).toContain(PASSWORD_HINT);
  });

  it('server rejection of the password shows PASSWORD_HINT at the field, not the server text', () => {
    const rejection = new HttpErrorResponse({ status: 400, error: { non_field_errors: ['This password is too common.'] } });
    spyOn(TestBed.inject(ApiService), 'registerUser').and.returnValue(throwError(() => rejection));
    component.registerForm.patchValue({ username: 'a@b.de', password: 'password1', password_confirm: 'password1' });

    component.onSubmit();
    fixture.detectChanges();

    const password = component.registerForm.get('password')!;
    password.markAsTouched();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(password.hasError('serverRejected')).toBeTrue();
    expect(fixture.nativeElement.querySelector('mat-error')?.textContent).toContain(PASSWORD_HINT);
    expect(text).not.toContain('too common');
  });
});
