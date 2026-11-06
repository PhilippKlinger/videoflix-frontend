import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, AuthLayoutComponent],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm!: FormGroup;
  loading = false;
  success = false;
  formError = '';

  fb = inject(FormBuilder);
  api = inject(ApiService);
  router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.formError = '';
    this.loading = true;
    this.api.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3500);
      },
      error: () => {
        this.loading = false;
        this.formError = 'Could not send reset instructions. Please try again.';
      }
    });
  }
}
