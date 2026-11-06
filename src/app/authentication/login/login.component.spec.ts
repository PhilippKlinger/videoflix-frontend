import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from 'src/app/services/auth-service.service';
import { CurrentUser } from 'src/app/models/user.model';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])]
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('offers the demo next to the sign-up', () => {
    expect(fixture.nativeElement.querySelector('app-demo-button')).not.toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to /browse after login', () => {
    const user: CurrentUser = { id: 1, email: 'a@b.de', role: 'member' };
    const loginSpy = spyOn(TestBed.inject(AuthService), 'login').and.returnValue(of(user));
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    component.loginForm.setValue({ email: 'a@b.de', password: 'pw' });
    component.onSubmit();

    expect(loginSpy).toHaveBeenCalledWith({ email: 'a@b.de', password: 'pw' });
    expect(navigateSpy).toHaveBeenCalledWith(['/browse']);
  });

  it("failed login shows 'Email or password is incorrect.' with role alert next to the form", () => {
    spyOn(TestBed.inject(AuthService), 'login').and.returnValue(throwError(() => 'Please check your entries and try again.'));

    component.loginForm.setValue({ email: 'a@b.de', password: 'wrong' });
    component.onSubmit();
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Email or password is incorrect.');
    expect(document.querySelector('mat-snack-bar-container')).toBeNull();
  });
});
