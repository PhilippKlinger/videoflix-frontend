import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { Router, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material/material.module';
import { DemoButtonComponent } from '../demo-button/demo-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    AuthLayoutComponent,
    RouterModule,
    DemoButtonComponent
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  requestloading = false;
  showPassword = false;

  fb = inject(FormBuilder);
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
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
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
