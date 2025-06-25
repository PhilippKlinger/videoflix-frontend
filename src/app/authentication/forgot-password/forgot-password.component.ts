import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, AuthLayoutComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm!: FormGroup;
  loading = false;
  success = false;

  fb = inject(FormBuilder);
  api = inject(ApiService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  constructor() { }

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;
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
        this.snackBar.open(
          'Could not send reset instructions. Please try again.',
          'Close',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }
}
