import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';
import { ApiService } from 'src/app/services/api.service';
import { PASSWORD_HINT } from '../password-rules';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ uid: 'MQ', token: 'abc' })) } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('posts uid, token and both passwords', () => {
    const confirmSpy = spyOn(TestBed.inject(ApiService), 'resetPasswordConfirm').and.returnValue(of({}));
    component.resetForm.setValue({ new_password: 'secret12', confirm_password: 'secret12' });

    component.onSubmit();

    expect(confirmSpy).toHaveBeenCalledWith('MQ', 'abc', { new_password: 'secret12', confirm_password: 'secret12' });
  });

  it('flags mismatching passwords', () => {
    component.resetForm.setValue({ new_password: 'a12345', confirm_password: 'b12345' });
    expect(component.resetForm.errors?.['mismatch']).toBeTrue();
  });

  it('password with 7 characters is invalid, with 8 valid', () => {
    const password = component.resetForm.get('new_password')!;
    password.setValue('abcdefg1');
    expect(password.valid).toBeTrue();
    password.setValue('abcdef1');
    expect(password.valid).toBeFalse();
  });

  it('server rejection of the password shows PASSWORD_HINT at the field, not the server text', () => {
    const rejection = new HttpErrorResponse({ status: 400, error: { non_field_errors: ['This password is too common.'] } });
    spyOn(TestBed.inject(ApiService), 'resetPasswordConfirm').and.returnValue(throwError(() => rejection));
    component.resetForm.setValue({ new_password: 'password1', confirm_password: 'password1' });

    component.onSubmit();
    component.resetForm.get('new_password')!.markAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-error')?.textContent).toContain(PASSWORD_HINT);
    expect(fixture.nativeElement.textContent).not.toContain('too common');
  });
});
