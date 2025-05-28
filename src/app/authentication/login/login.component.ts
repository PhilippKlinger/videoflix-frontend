import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
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
    private route: ActivatedRoute,
    private errorService: ErrorHandlingService) { }

  ngOnInit(): void {
    this.initLoginForm();
    this.prefillEmail();

    this.errorService.getErrorMessage().subscribe((message) => {
      this.errorMessage = message;
    });

    this.route.queryParams.subscribe(params => {
      switch (params['status']) {
        case 'activated':
          this.statusMessage = 'Ihr Konto wurde erfolgreich aktiviert.';
          break;
        case 'expired':
          this.statusMessage = 'Ihr Aktivierungscode ist abgelaufen. Bitte fordern Sie einen neuen an.';
          break;
        case 'invalid':
          this.statusMessage = 'Ungültiger Aktivierungscode. Bitte überprüfen Sie den Link oder fordern Sie einen neuen an.';
          break;
        case 'password-reset':
          this.activationCode = params['code'];
          this.selectLoginFormAction = 'passwordResetConfirm';
          break;
        case 'invalid-reset':
          this.statusMessage = 'Bereits genutzter Passwortreset-Link. Bitte fordern Sie einen neuen an.';
          break;
        case 'expired-reset':
          this.statusMessage = 'Ihr Passwortreset-Link ist abgelaufen. Bitte fordern Sie einen neuen an.';
          break;
        default:
          this.statusMessage = '';
      }
    });
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

  //fehlermeldungen anzeigen lassen die von backend kommen
  onSubmit(): void {
    this.errorMessage = '';
    this.statusMessage = '';
    if (this.loginForm.valid) {
      this.requestloading = true;
      this.apiService.loginUser(this.loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user_id);
          localStorage.removeItem('emailForLogin');
          this.router.navigate(['/profiles']);
          this.requestloading = false;
        },
        error: (error) => {
          this.requestloading = false;
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
