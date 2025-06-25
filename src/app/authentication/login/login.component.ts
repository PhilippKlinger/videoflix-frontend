import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { Router, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    AuthLayoutComponent,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  requestloading = false;
  showPassword = false;

  fb = inject(FormBuilder);
  api = inject(ApiService);
  authService = inject(AuthService);
  router = inject(Router);
  errorService = inject(ErrorHandlingService);
  snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    const emailForLogin = localStorage.getItem('emailForLogin');
    if (emailForLogin) {
      this.loginForm.get('email')?.setValue(emailForLogin);
    }

    this.errorService.getErrorMessage().subscribe(message => {
      if (message) this.showError(message);
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.showError('Please enter valid credentials.');
      return;
    }
    this.requestloading = true;
    this.api.loginUser(this.loginForm.value).subscribe({
      next: (response) => {
        this.authService.setAuthCredentials(response.token, response.user_id, response.email || '');
        localStorage.removeItem('emailForLogin');
        this.requestloading = false;
        this.router.navigate(['/browse']);
      },
      error: () => {
        this.requestloading = false;
        this.showError('Please check your entries and try again.');
      }
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
  }
}
