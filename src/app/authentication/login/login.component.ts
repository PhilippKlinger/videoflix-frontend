import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthLayoutComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],

})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordResetForm!: FormGroup;
  passwordResetConfirmForm!: FormGroup;
  selectLoginFormAction: string = 'login';
  resetEmail: string = '';
  errorMessage: string = '';
  statusMessage: string = '';
  requestloading: boolean = false;
  activationCode: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private errorService: ErrorHandlingService) { }

  ngOnInit(): void {
    this.initLoginForm();
    this.prefillEmail();

  }

  initLoginForm() {
    this.errorMessage = '';
    this.statusMessage = '';
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.passwordResetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordResetConfirmForm = this.formBuilder.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('new_password');
    const passwordConfirm = form.get('confirm_password');
    return password && passwordConfirm && password.value === passwordConfirm.value ? null : { 'mismatch': true };
  }

  prefillEmail() {
    const emailForLogin = localStorage.getItem('emailForLogin');
    if (emailForLogin) {
      this.loginForm.controls['email'].setValue(emailForLogin);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.statusMessage = '';
    if (this.loginForm.valid) {
      this.requestloading = true;
      this.apiService.loginUser(this.loginForm.value).subscribe({
        next: (response) => {
          this.authService.setAuthCredentials(
            response.token,
            response.user_id,
            response.username || ''
          );
          localStorage.removeItem('emailForLogin');
          this.requestloading = false;
          this.router.navigate(['/browse']);
        },
        error: (error) => {
          this.requestloading = false;
          this.errorMessage = 'Bitte überprüfe deine Eingaben und versuche es erneut.';
        }
      });
    }
  }

  onSubmitPasswordResetRequest() {
    this.errorMessage = '';
    this.statusMessage = '';
    if (this.passwordResetForm.valid) {
      this.requestloading = true;
      this.apiService.resetPassword(this.passwordResetForm.value).subscribe({
        next: (response) => {
          this.selectLoginFormAction = 'passwordResetRequestSuccessful';
          this.requestloading = false;
        },
        error: (error) => {
          this.requestloading = false;
        }
      });
    }
  }

  onSubmitPasswordResetConfirm() {
    this.errorMessage = '';
    this.statusMessage = '';
    if (this.passwordResetConfirmForm.valid) {
      this.requestloading = true;
      this.apiService.resetPasswordConfirm(this.activationCode, this.passwordResetConfirmForm.value).subscribe({
        next: (response) => {
          console.log('Password reset successful', response);
          this.requestloading = false;
        },
        error: (error) => {
          this.requestloading = false;
        }
      });
    }
  }


  togglePasswordResetForm(): void {
    this.errorMessage = '';
    this.statusMessage = '';
    this.selectLoginFormAction = 'passwordReset';
  }

  toggleLoginForm(): void {
    this.errorMessage = '';
    this.statusMessage = '';
    this.selectLoginFormAction = 'login';
  }
}
