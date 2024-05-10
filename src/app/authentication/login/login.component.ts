import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordResetForm!: FormGroup;
  selectLoginFormAction: string = 'login';
  resetEmail: string = '';
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router) { }

  ngOnInit(): void {
    this.initLoginForm();
    this.prefillEmail();
  }

  initLoginForm() {
    this.loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    this.passwordResetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
}

prefillEmail() {
    const emailForLogin = localStorage.getItem('emailForLogin');
    if (emailForLogin) {
        this.loginForm.controls['email'].setValue(emailForLogin);
    }
}

  //fehlermeldungen anzeigen lassen die von backend kommen
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.apiService.loginUser(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user_id);
          localStorage.removeItem('emailForLogin');
            this.router.navigate(['/profiles']);
        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
    }
  }

  onSubmitPasswordReset() {
    if (this.passwordResetForm.valid) {
      this.apiService.resetPassword(this.passwordResetForm.value).subscribe({
        next: (response) => {
          console.log('Password reset successful', response);
          this.errorMessage = '';
          this.selectLoginFormAction = 'passwordResetSuccessful';
        },
        error: (error) => {
          console.error('Password reset failed', error);
    
          this.errorMessage = error.error ;
          console.log('erorrmessage', this.errorMessage)
        }
      });
    }
  }


  togglePasswordResetForm(): void {
    this.selectLoginFormAction = 'passwordReset';
  }

  toggleLoginForm(): void {
    this.selectLoginFormAction = 'login';
  }
}
