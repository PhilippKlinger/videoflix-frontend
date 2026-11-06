import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth-service.service';
import { Router, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
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
  loginFailed = false;

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    const emailForLogin = localStorage.getItem('emailForLogin');
    if (emailForLogin) {
      this.loginForm.get('email')?.setValue(emailForLogin);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loginFailed = false;
    this.requestloading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        localStorage.removeItem('emailForLogin');
        this.requestloading = false;
        this.router.navigate(['/browse']);
      },
      error: () => {
        this.requestloading = false;
        this.loginFailed = true;
      }
    });
  }
}
