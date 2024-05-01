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

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirm: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
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
              window.location.href = '/login'; // Weiterleitung zur Login-Seite
            }
          }, 1000);
        },
        error: (error) => {
          console.error('Registration failed', error);
        }
      });
    }
  }
}
