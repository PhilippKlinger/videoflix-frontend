
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { MaterialModule } from 'src/app/material/material.module';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, AuthLayoutComponent, MaterialModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  emailCheckForm!: FormGroup;
  requestloading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
     this.emailCheckForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

 onSubmitEmailCheck(): void {
    if (this.emailCheckForm.invalid) return;

    const email = this.emailCheckForm.controls['email'].value;
    localStorage.setItem('emailForLogin', email);

    this.router.navigate(['/register']);
  }

   showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}
