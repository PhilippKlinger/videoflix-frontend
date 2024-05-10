import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  emailCheckForm!: FormGroup;
  selectRegisterFormAction: string = 'enterEmail';
  newEmail: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirm: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.emailCheckForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const passwordConfirm = form.get('password_confirm');
    return password && passwordConfirm && password.value === passwordConfirm.value ? null : { 'mismatch': true };
  }

  //Fehlermeldunge anzeigen lassen die von backend kommen
  onSubmit() {
    let timeLeft = 10;
    let countdownElement: any = document.getElementById('countdown');
    let message: any = document.getElementById('success-message');

    if (this.registerForm.valid) {
      this.apiService.registerUser(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          message.style.display = 'block';
          const countdownTimer = setInterval(() => {
            timeLeft--;
            countdownElement.innerHTML = `${timeLeft}`;

            if (timeLeft <= 0) {
              clearInterval(countdownTimer);
              this.router.navigate(['/login']);
            }
          }, 1000);
        },
        error: (error) => {
          console.error('Registration failed', error);
        }
      });
    }
  }



  onSubmitEmailCheck() {
    if (this.emailCheckForm.valid) {
      this.apiService.registerUserEmail(this.emailCheckForm.value).subscribe({
        next: (response) => {
          console.log('Email check successful', response);
          if (response.user_exists) {
            this.registerForm.controls['email'].setValue(this.emailCheckForm.controls['email'].value);
            localStorage.setItem('emailForLogin', this.emailCheckForm.controls['email'].value);
            this.router.navigate(['/login']);
          } else {
            this.selectRegisterFormAction = 'registerNewUser';
            this.registerForm.controls['email'].setValue(this.emailCheckForm.controls['email'].value);
          }
        },
        error: (error) => {
          console.error('Email check failed', error);
        }
      });
    }
  }


}
