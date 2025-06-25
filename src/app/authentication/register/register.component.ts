import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    AuthLayoutComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  requestloading = false;
  registerSuccess = false;
  errorMessage = '';
  timeLeft = 5;
  countdownTimer: any;
  showPassword = false;
  showConfirmPassword = false;

  fb = inject(FormBuilder);
  api = inject(ApiService);
  errorService = inject(ErrorHandlingService);
  snackBar = inject(MatSnackBar);

  constructor() { }

  ngOnInit(): void {
    const emailFromStorage = localStorage.getItem('emailForLogin') || '';

    this.registerForm = this.fb.group({
      email: [emailFromStorage],
      username: [emailFromStorage, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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

    this.errorService.getErrorMessage().subscribe(message => {
      if (message) this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
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

    this.requestloading = true;

    this.api.registerUser(this.registerForm.value).subscribe({
      next: () => {
        this.registerSuccess = true;
        this.requestloading = false;

        this.snackBar.open('Registration successful! Redirect...', 'OK', { duration: 3000 });

      },
      error: () => {
        this.requestloading = false;
        this.snackBar.open('Registration unsuccessful! Please try again.', 'OK', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
