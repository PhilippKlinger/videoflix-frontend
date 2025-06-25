import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    AuthLayoutComponent
  ],
  templateUrl: './reset-password.component.html',
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
  code: string = '';


  fb = inject(FormBuilder);
  api = inject(ApiService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  route = inject(ActivatedRoute)

  constructor() { }

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.route.paramMap.subscribe(params => {
      const codeParam = params.get('code');
      if (codeParam) {
        this.code = codeParam;
      } else {

        this.router.navigate(['/forgot-password']);
      }
    }
    )
  };

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('password_confirm')?.value;
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
    this.loading = true;
    this.api.resetPasswordConfirm(this.code, this.resetForm.value).subscribe({
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
      error: () => {
        this.loading = false;
        this.snackBar.open('Error while resetting the password. Please try again.', 'OK', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
