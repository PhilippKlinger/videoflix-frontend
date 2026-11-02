import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { ApiService } from 'src/app/services/api.service';

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
});
