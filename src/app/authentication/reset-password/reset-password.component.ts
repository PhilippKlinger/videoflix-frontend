import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { ApiService } from 'src/app/services/api.service';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, isPasswordRejection } from '../password-rules';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    AuthLayoutComponent
  ],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm!: FormGroup;
  loading = false;
  resetSuccess = false;
  timeLeft = 5;
  countdownTimer: any;
  showPassword = false;
  showConfirmPassword = false;
  uid = '';
  token = '';
  formError = '';
  readonly passwordHint = PASSWORD_HINT;


  fb = inject(FormBuilder);
  api = inject(ApiService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  route = inject(ActivatedRoute)

  constructor() { }

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.route.paramMap.subscribe(params => {
      const uid = params.get('uid');
      const token = params.get('token');
      if (uid && token) {
        this.uid = uid;
        this.token = token;
      } else {

        this.router.navigate(['/forgot-password']);
      }
    }
    )
  };

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('new_password')?.value;
    const confirm = form.get('confirm_password')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;
    this.formError = '';
    this.loading = true;
    this.api.resetPasswordConfirm(this.uid, this.token, this.resetForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.resetSuccess = true;
        this.snackBar.open('Password reset succesfully! Redirect...', 'OK', { duration: 3000 });
        this.countdownTimer = setInterval(() => {
          this.timeLeft--;
          if (this.timeLeft <= 0) {
            clearInterval(this.countdownTimer);
            this.router.navigate(['/login']);
          }
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        if (isPasswordRejection(error)) {
          const password = this.resetForm.get('new_password')!;
          password.setErrors({ serverRejected: true });
          password.markAsTouched();
        } else {
          this.formError = 'The password could not be reset. The link may have expired; please request a new one.';
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
