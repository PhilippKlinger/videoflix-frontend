import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, isPasswordRejection } from '../password-rules';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    AuthLayoutComponent
  ],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  requestloading = false;
  registerSuccess = false;
  formError = '';
  readonly passwordHint = PASSWORD_HINT;
  timeLeft = 5;
  countdownTimer: any;
  showPassword = false;
  showConfirmPassword = false;

  fb = inject(FormBuilder);
  api = inject(ApiService);
  snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: [''],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
      password_confirm: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('username')!.valueChanges.subscribe(value => {
      this.registerForm.get('email')!.setValue(value, { emitEvent: false });
    });

    this.registerForm.get('password')!.valueChanges.subscribe(() => {
      this.registerForm.updateValueAndValidity();
    });

    this.registerForm.get('password_confirm')!.valueChanges.subscribe(() => {
      this.registerForm.updateValueAndValidity();
    });
  }


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
    if (this.registerForm.invalid) return;

    this.formError = '';
    this.requestloading = true;

    const { email, password, password_confirm } = this.registerForm.value;
    this.api.registerUser({ email, password, confirmed_password: password_confirm }).subscribe({
      next: () => {
        this.registerSuccess = true;
        this.requestloading = false;

        this.snackBar.open('Registration successful! Please check your email.', 'OK', { duration: 3000 });

      },
      error: (error) => {
        this.requestloading = false;
        if (isPasswordRejection(error)) {
          const password = this.registerForm.get('password')!;
          password.setErrors({ serverRejected: true });
          password.markAsTouched();
        } else {
          this.formError = error instanceof HttpErrorResponse && error.status === 400
            ? 'Registration was not successful. Please check your entries and try again.'
            : 'Registration did not work. Please try again in a moment.';
        }
      }
    });
  }
}
