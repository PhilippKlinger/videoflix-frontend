import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';
import { ApiService } from 'src/app/services/api.service';

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
});
